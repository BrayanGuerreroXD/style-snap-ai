import { useMutation } from '@tanstack/react-query'
import { generateImage } from '@/services/generation'
import type { GenerateRequest, GenerationResult } from '@/types/generation'

/** React Query mutation wrapping the generation call. */
export function useGenerateImage() {
  return useMutation<GenerationResult, Error, GenerateRequest>({
    mutationFn: generateImage,
    retry: false,
  })
}
