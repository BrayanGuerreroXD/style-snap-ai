// Server-side style catalog. The frontend only sends a styleId; the actual
// generation prompt lives here so clients can never inject arbitrary prompts.
// Keep ids in sync with src/constants/styles.ts.

export interface StylePrompt {
  id: string
  prompt: string
}

// Image editing instructions for Hugging Face FLUX.2-klein-9B (image-to-image).
// The user's selfie is the input; each style is phrased as a restyling target
// so the model keeps the person's identity and pose while changing the art style.
export const STYLE_PROMPTS: Record<string, string> = {
  'pixel-art': 'detailed 8-bit pixel art',
  anime: 'an anime hero, cel-shaded and dynamic',
  medieval: 'a magical medieval fantasy mage with ornate robes',
  cyberpunk: 'a cyberpunk rebel with neon lighting',
  comic: 'a comic book superhero with bold inks and halftone shading',
  'oil-painting': 'a classic oil painting, museum quality',
}

export function buildPrompt(stylePrompt: string): string {
  return [
    `Restyle this portrait as ${stylePrompt}.`,
    'Keep the same person, facial identity, pose and composition.',
    'High quality, highly detailed, artistic. No text, no watermark.',
  ].join(' ')
}
