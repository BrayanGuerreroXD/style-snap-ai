import { supabase, GENERATE_FUNCTION } from './supabase'
import { AppError } from '@/types/generation'
import type { GenerateRequest, GenerationResult } from '@/types/generation'

const GENERATION_TIMEOUT_MS = 90_000

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new AppError('generation-timeout', 'La generación tardó demasiado.')),
      ms,
    )
    promise.then(
      (v) => {
        clearTimeout(timer)
        resolve(v)
      },
      (e) => {
        clearTimeout(timer)
        reject(e)
      },
    )
  })
}

/** Call the Edge Function to transform a selfie into an artistic portrait. */
export async function generateImage(req: GenerateRequest): Promise<GenerationResult> {
  let response
  try {
    response = await withTimeout(
      supabase.functions.invoke<GenerationResult & { error?: string; code?: string }>(
        GENERATE_FUNCTION,
        { body: req },
      ),
      GENERATION_TIMEOUT_MS,
    )
  } catch (e) {
    if (e instanceof AppError) throw e
    throw new AppError('network-error', 'No se pudo conectar con el servidor.')
  }

  const { data, error } = response
  if (error) {
    throw new AppError('gemini-error', error.message || 'Error generando la imagen.')
  }
  if (!data || !data.generatedUrl) {
    throw new AppError('gemini-error', 'Respuesta inválida del servidor.')
  }
  return {
    id: data.id,
    styleId: data.styleId,
    generatedUrl: data.generatedUrl,
    originalUrl: data.originalUrl,
  }
}

/** Fetch a previously generated result by id (for the /result/:id deep link). */
export async function getGeneration(id: string): Promise<GenerationResult> {
  const { data, error } = await supabase.functions.invoke<
    GenerationResult & { error?: string }
  >(`${GENERATE_FUNCTION}/${id}`, { method: 'GET' })

  if (error || !data || !data.generatedUrl) {
    throw new AppError('not-found', 'No se encontró la generación.')
  }
  return data
}
