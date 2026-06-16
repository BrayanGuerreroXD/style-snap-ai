/**
 * Capture a still frame from a <video> element and downscale it so the payload
 * sent to the Edge Function stays light (max edge ~1024px, JPEG quality ~0.85).
 * Returns a JPEG data URL.
 */
export function captureFrame(
  video: HTMLVideoElement,
  maxEdge = 1024,
  quality = 0.85,
): string {
  const vw = video.videoWidth
  const vh = video.videoHeight
  if (!vw || !vh) {
    throw new Error('invalid-capture')
  }

  const scale = Math.min(1, maxEdge / Math.max(vw, vh))
  const w = Math.round(vw * scale)
  const h = Math.round(vh * scale)

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('invalid-capture')
  }

  // Mirror horizontally so the captured selfie matches the previewed image.
  ctx.translate(w, 0)
  ctx.scale(-1, 1)
  ctx.drawImage(video, 0, 0, w, h)

  return canvas.toDataURL('image/jpeg', quality)
}

/** Trigger a browser download for an image URL. */
export async function downloadImage(url: string, filename: string): Promise<void> {
  const res = await fetch(url)
  const blob = await res.blob()
  const objectUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = objectUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(objectUrl)
}
