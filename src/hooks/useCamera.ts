import { useCallback, useEffect, useRef, useState } from 'react'
import { AppError } from '@/types/generation'

type CameraStatus = 'idle' | 'starting' | 'ready' | 'error'

/**
 * Manages the front-facing camera stream and binds it to a <video> element.
 * Handles permission denial and cleans up tracks on unmount.
 */
export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [status, setStatus] = useState<CameraStatus>('idle')
  const [error, setError] = useState<AppError | null>(null)

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }, [])

  const start = useCallback(async () => {
    setStatus('starting')
    setError(null)
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new AppError('camera-denied', 'Este dispositivo no soporta la cámara.')
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play().catch(() => undefined)
      }
      setStatus('ready')
    } catch (e) {
      stop()
      const err =
        e instanceof AppError
          ? e
          : new AppError('camera-denied', 'No se pudo acceder a la cámara. Revisa los permisos.')
      setError(err)
      setStatus('error')
    }
  }, [stop])

  useEffect(() => () => stop(), [stop])

  return { videoRef, status, error, start, stop }
}
