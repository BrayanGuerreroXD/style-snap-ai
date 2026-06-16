export interface GenerateRequest {
  /** Data URL or raw base64 of the captured selfie (JPEG). */
  image: string
  styleId: string
}

export interface GenerationResult {
  id: string
  styleId: string
  generatedUrl: string
  originalUrl: string
}

export type AppErrorCode =
  | 'camera-denied'
  | 'invalid-capture'
  | 'generation-timeout'
  | 'gemini-error'
  | 'storage-error'
  | 'network-error'
  | 'not-found'
  | 'unknown'

export class AppError extends Error {
  code: AppErrorCode
  constructor(code: AppErrorCode, message: string) {
    super(message)
    this.code = code
    this.name = 'AppError'
  }
}
