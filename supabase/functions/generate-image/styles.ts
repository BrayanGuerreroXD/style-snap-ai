// Server-side style catalog. The frontend only sends a styleId; the actual
// generation prompt lives here so clients can never inject arbitrary prompts.
// Keep ids in sync with src/constants/styles.ts.

export interface StylePrompt {
  id: string
  prompt: string
}

// Text-to-image prompts for Hugging Face FLUX.1-schnell. The serverless
// inference API is text-only, so each prompt fully describes the portrait
// (the user's selfie is stored but not used as a generation input).
export const STYLE_PROMPTS: Record<string, string> = {
  'pixel-art': 'a detailed 8-bit pixel art portrait of a heroic character',
  anime: 'an anime hero portrait, cel-shaded, dynamic',
  medieval: 'a magical medieval fantasy mage portrait, ornate robes',
  cyberpunk: 'a cyberpunk futuristic rebel portrait with neon lighting',
  comic: 'a comic book superhero portrait, bold inks, halftone shading',
  'oil-painting': 'a realistic classic oil painting portrait, museum quality',
}

export function buildPrompt(stylePrompt: string): string {
  return [
    `${stylePrompt},`,
    'close-up head and shoulders, looking at the camera, centered composition,',
    'high quality, highly detailed, artistic, vibrant, dramatic lighting,',
    'no text, no watermark',
  ].join(' ')
}
