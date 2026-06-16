// Edge Function: generate-image
// POST { image, styleId } -> calls Gemini 2.5 Flash Image, stores both images,
//   records the generation, returns signed URLs.
// GET  /generate-image/:id -> returns fresh signed URLs for a past generation.
//
// Secrets (supabase secrets set ...):
//   GEMINI_API_KEY      required for real generation
//   MOCK_GENERATION     "true" to skip Gemini and echo the selfie (demo without billing)
// Auto-injected by the runtime: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from 'jsr:@supabase/supabase-js@2'
import { STYLE_PROMPTS, SYSTEM_PROMPT, buildUserPrompt } from './styles.ts'

const GEMINI_MODEL = 'gemini-2.5-flash-image'
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

async function callGemini(base64: string, stylePrompt: string): Promise<Uint8Array> {
  const apiKey = Deno.env.get('GEMINI_API_KEY')
  if (!apiKey) throw new Error('gemini-error: missing GEMINI_API_KEY')

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: 'POST',
      headers: { 'x-goog-api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [
          {
            role: 'user',
            parts: [
              { text: buildUserPrompt(stylePrompt) },
              { inline_data: { mime_type: 'image/jpeg', data: base64 } },
            ],
          },
        ],
        generationConfig: { responseModalities: ['IMAGE'] },
      }),
    },
  )

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`gemini-error: ${res.status} ${text.slice(0, 300)}`)
  }

  const data = await res.json()
  const parts = data?.candidates?.[0]?.content?.parts ?? []
  for (const p of parts) {
    const inline = p.inlineData ?? p.inline_data
    if (inline?.data) {
      const binary = atob(inline.data)
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
      return bytes
    }
  }
  throw new Error('gemini-error: no image in response')
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

  // Generate (or mock).
  let generatedBytes: Uint8Array
  const mock = Deno.env.get('MOCK_GENERATION') === 'true'
  try {
    generatedBytes = mock ? originalBytes : await callGemini(base64, stylePrompt)
  } catch (e) {
    const msg = String(e)
    const code = msg.includes('storage-error') ? 'storage-error' : 'gemini-error'
    return json({ error: msg, code }, 502)
  }

  // Store both images.
  const id = crypto.randomUUID()
  const originalPath = `${id}.jpg`
  const generatedPath = `${id}.png`
  try {
    const up1 = await admin.storage
      .from(SELFIES_BUCKET)
      .upload(originalPath, originalBytes, { contentType: 'image/jpeg', upsert: true })
    if (up1.error) throw new Error(`storage-error: ${up1.error.message}`)
    const up2 = await admin.storage
      .from(GENERATED_BUCKET)
      .upload(generatedPath, generatedBytes, {
        contentType: mock ? 'image/jpeg' : 'image/png',
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
