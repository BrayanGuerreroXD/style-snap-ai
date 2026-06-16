// Edge Function: generate-image
// POST { image, styleId } -> generates a portrait with Hugging Face FLUX.1-schnell
//   (text-to-image), stores the selfie + generated image, records the
//   generation, returns signed URLs.
// GET  /generate-image/:id -> returns fresh signed URLs for a past generation.
//
// Secrets (supabase secrets set ...):
//   HF_TOKEN            required for real generation (Hugging Face)
//   HF_MODEL            optional, defaults to black-forest-labs/FLUX.1-schnell
//   MOCK_GENERATION     "true" to skip HF and echo the selfie (offline demo)
// Auto-injected by the runtime: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from 'jsr:@supabase/supabase-js@2'
import { STYLE_PROMPTS, buildPrompt } from './styles.ts'

const DEFAULT_HF_MODEL = 'black-forest-labs/FLUX.1-schnell'
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

// Calls the Hugging Face serverless inference router (text-to-image). The
// endpoint returns raw image bytes (image/jpeg). Retries on 503 cold-starts.
async function callHuggingFace(prompt: string): Promise<Uint8Array> {
  const token = Deno.env.get('HF_TOKEN')
  if (!token) throw new Error('gemini-error: missing HF_TOKEN')
  const model = Deno.env.get('HF_MODEL') ?? DEFAULT_HF_MODEL
  const endpoint = `https://router.huggingface.co/hf-inference/models/${model}`

  const maxAttempts = 3
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        // Block until the model is warm instead of failing fast on cold start.
        'x-wait-for-model': 'true',
      },
      body: JSON.stringify({ inputs: prompt }),
    })

    const contentType = res.headers.get('content-type') ?? ''
    if (res.ok && contentType.startsWith('image/')) {
      return new Uint8Array(await res.arrayBuffer())
    }

    const text = await res.text()
    // 503 => model still loading; back off and retry.
    if (res.status === 503 && attempt < maxAttempts) {
      await new Promise((r) => setTimeout(r, 4000 * attempt))
      continue
    }
    throw new Error(`gemini-error: HF ${res.status} ${text.slice(0, 300)}`)
  }
  throw new Error('gemini-error: HF model did not respond in time')
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

  const { bytes: originalBytes } = stripDataUrl(image)

  // Generate (or mock).
  let generatedBytes: Uint8Array
  const mock = Deno.env.get('MOCK_GENERATION') === 'true'
  try {
    generatedBytes = mock ? originalBytes : await callHuggingFace(buildPrompt(stylePrompt))
  } catch (e) {
    const msg = String(e)
    const code = msg.includes('storage-error') ? 'storage-error' : 'gemini-error'
    return json({ error: msg, code }, 502)
  }

  // Store both images.
  const id = crypto.randomUUID()
  const originalPath = `${id}.jpg`
  const generatedPath = `${id}.jpg`
  try {
    const up1 = await admin.storage
      .from(SELFIES_BUCKET)
      .upload(originalPath, originalBytes, { contentType: 'image/jpeg', upsert: true })
    if (up1.error) throw new Error(`storage-error: ${up1.error.message}`)
    const up2 = await admin.storage
      .from(GENERATED_BUCKET)
      .upload(generatedPath, generatedBytes, {
        contentType: 'image/jpeg',
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
