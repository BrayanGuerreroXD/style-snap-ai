// Edge Function: generate-image
// POST { image, styleId } -> edits the selfie into the chosen style
//   (image-to-image), stores the selfie + generated image, records the
//   generation, returns signed URLs.
// GET  /generate-image/:id -> returns fresh signed URLs for a past generation.
//
// Generation backend is chosen by secrets (first match wins):
//   MOCK_GENERATION="true"  -> echo the selfie (offline demo)
//   HF_SPACE="owner/Space"  -> free img2img via a public Gradio Space (no credits)
//   otherwise               -> paid HF Inference provider (HF_MODEL/HF_PROVIDER)
//
// Secrets (supabase secrets set ...):
//   HF_TOKEN            Hugging Face token (paid provider path)
//   HF_MODEL            defaults to black-forest-labs/FLUX.2-klein-9B
//   HF_PROVIDER         defaults to "replicate"
//   HF_SPACE            e.g. "Manjushri/SDXL-Turbo-Img2Img-CPU" (free path)
//   MOCK_GENERATION     "true" to echo the selfie
// Auto-injected by the runtime: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from 'jsr:@supabase/supabase-js@2'
import { InferenceClient } from 'npm:@huggingface/inference@4'
import { STYLE_PROMPTS, buildPrompt } from './styles.ts'

const DEFAULT_HF_MODEL = 'black-forest-labs/FLUX.2-klein-9B'
const DEFAULT_HF_PROVIDER = 'replicate'
const SPACE_STRENGTH = 0.6 // how much of the selfie structure to keep (0..1)
const SPACE_STEPS = 2
const SPACE_TIMEOUT_MS = 80_000
const SELFIES_BUCKET = 'selfies'
const GENERATED_BUCKET = 'generated'
const SIGNED_URL_TTL = 3600 // 1 hour

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

const admin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

function stripDataUrl(image: string): { bytes: Uint8Array; base64: string } {
  const base64 = image.includes(',') ? image.split(',')[1] : image
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return { bytes, base64 }
}

interface GenResult {
  bytes: Uint8Array
  contentType: string
}

// Paid path: HF Inference image-to-image (FLUX.2-klein-9B via a paid provider).
async function callHuggingFace(imageBytes: Uint8Array, prompt: string): Promise<GenResult> {
  const token = Deno.env.get('HF_TOKEN')
  if (!token) throw new Error('gemini-error: missing HF_TOKEN')
  const model = Deno.env.get('HF_MODEL') ?? DEFAULT_HF_MODEL
  const provider = Deno.env.get('HF_PROVIDER') ?? DEFAULT_HF_PROVIDER

  const client = new InferenceClient(token)
  try {
    const out = await client.imageToImage(
      {
        model,
        inputs: new Blob([imageBytes], { type: 'image/jpeg' }),
        parameters: { prompt },
      },
      { provider },
    )
    return { bytes: new Uint8Array(await out.arrayBuffer()), contentType: 'image/jpeg' }
  } catch (e) {
    throw new Error(`gemini-error: HF ${e instanceof Error ? e.message : String(e)}`)
  }
}

// Free path: drive a public Gradio Space's HTTP API for img2img. Two steps:
// POST /gradio_api/call/predict -> event_id, then GET .../predict/{id} (SSE).
async function callSpace(base64: string, prompt: string): Promise<GenResult> {
  const space = Deno.env.get('HF_SPACE')!
  const host = `https://${space.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.hf.space`
  const fileData = {
    url: `data:image/jpeg;base64,${base64}`,
    meta: { _type: 'gradio.FileData' },
  }
  // Vary the seed per request so retries differ.
  const seed = Math.floor(Math.random() * 1_000_000_000)

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), SPACE_TIMEOUT_MS)
  try {
    const post = await fetch(`${host}/gradio_api/call/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: [fileData, prompt, SPACE_STEPS, seed, SPACE_STRENGTH] }),
      signal: ctrl.signal,
    })
    if (!post.ok) throw new Error(`space POST ${post.status}`)
    const { event_id } = await post.json()
    if (!event_id) throw new Error('space returned no event_id')

    const res = await fetch(`${host}/gradio_api/call/predict/${event_id}`, {
      signal: ctrl.signal,
    })
    const text = await res.text()
    const complete = text.match(/event: complete\s*\ndata: (.+)/)
    if (!complete) {
      const err = text.match(/event: error\s*\ndata: (.+)/)
      throw new Error(`space ${err ? err[1].slice(0, 200) : 'no result'}`)
    }
    const url = JSON.parse(complete[1])?.[0]?.url
    if (!url) throw new Error('space returned no output url')

    const imgRes = await fetch(url, { signal: ctrl.signal })
    const ct = imgRes.headers.get('content-type') ?? ''
    return {
      bytes: new Uint8Array(await imgRes.arrayBuffer()),
      contentType: ct.startsWith('image/') ? ct : 'image/webp',
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    throw new Error(`gemini-error: ${ctrl.signal.aborted ? 'space timeout' : msg}`)
  } finally {
    clearTimeout(timer)
  }
}

async function signedUrl(bucket: string, path: string): Promise<string> {
  const { data, error } = await admin.storage
    .from(bucket)
    .createSignedUrl(path, SIGNED_URL_TTL)
  if (error || !data) throw new Error(`storage-error: ${error?.message}`)
  return data.signedUrl
}

async function handlePost(req: Request): Promise<Response> {
  let body: { image?: string; styleId?: string }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON body', code: 'invalid-capture' }, 400)
  }

  const { image, styleId } = body
  if (!image || typeof image !== 'string') {
    return json({ error: 'Missing image', code: 'invalid-capture' }, 400)
  }
  const stylePrompt = styleId ? STYLE_PROMPTS[styleId] : undefined
  if (!styleId || !stylePrompt) {
    return json({ error: 'Unknown styleId', code: 'invalid-capture' }, 400)
  }

  const { bytes: originalBytes, base64 } = stripDataUrl(image)

  // Pick the generation backend (mock -> free Space -> paid provider).
  let result: GenResult
  const prompt = buildPrompt(stylePrompt)
  try {
    if (Deno.env.get('MOCK_GENERATION') === 'true') {
      result = { bytes: originalBytes, contentType: 'image/jpeg' }
    } else if (Deno.env.get('HF_SPACE')) {
      result = await callSpace(base64, prompt)
    } else {
      result = await callHuggingFace(originalBytes, prompt)
    }
  } catch (e) {
    const msg = String(e)
    const code = msg.includes('storage-error') ? 'storage-error' : 'gemini-error'
    return json({ error: msg, code }, 502)
  }

  // Store both images.
  const id = crypto.randomUUID()
  const genExt = result.contentType === 'image/webp' ? 'webp' : 'jpg'
  const originalPath = `${id}.jpg`
  const generatedPath = `${id}.${genExt}`
  try {
    const up1 = await admin.storage
      .from(SELFIES_BUCKET)
      .upload(originalPath, originalBytes, { contentType: 'image/jpeg', upsert: true })
    if (up1.error) throw new Error(`storage-error: ${up1.error.message}`)
    const up2 = await admin.storage
      .from(GENERATED_BUCKET)
      .upload(generatedPath, result.bytes, {
        contentType: result.contentType,
        upsert: true,
      })
    if (up2.error) throw new Error(`storage-error: ${up2.error.message}`)
  } catch (e) {
    return json({ error: String(e), code: 'storage-error' }, 502)
  }

  // Record the generation.
  const { error: dbError } = await admin.from('generations').insert({
    id,
    style_id: styleId,
    original_image_url: `${SELFIES_BUCKET}/${originalPath}`,
    generated_image_url: `${GENERATED_BUCKET}/${generatedPath}`,
  })
  if (dbError) return json({ error: dbError.message, code: 'storage-error' }, 502)

  return json({
    id,
    styleId,
    generatedUrl: await signedUrl(GENERATED_BUCKET, generatedPath),
    originalUrl: await signedUrl(SELFIES_BUCKET, originalPath),
  })
}

async function handleGet(id: string): Promise<Response> {
  const { data, error } = await admin
    .from('generations')
    .select('id, style_id, original_image_url, generated_image_url')
    .eq('id', id)
    .maybeSingle()
  if (error || !data) return json({ error: 'Not found', code: 'not-found' }, 404)

  const [genBucket, ...genRest] = data.generated_image_url.split('/')
  const [origBucket, ...origRest] = data.original_image_url.split('/')
  return json({
    id: data.id,
    styleId: data.style_id,
    generatedUrl: await signedUrl(genBucket, genRest.join('/')),
    originalUrl: await signedUrl(origBucket, origRest.join('/')),
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const url = new URL(req.url)
    // Path: /generate-image or /generate-image/:id
    const parts = url.pathname.split('/').filter(Boolean)
    const id = parts.length > 1 ? parts[parts.length - 1] : null

    if (req.method === 'GET' && id && id !== 'generate-image') {
      return await handleGet(id)
    }
    if (req.method === 'POST') {
      return await handlePost(req)
    }
    return json({ error: 'Method not allowed', code: 'unknown' }, 405)
  } catch (e) {
    return json({ error: String(e), code: 'unknown' }, 500)
  }
})
