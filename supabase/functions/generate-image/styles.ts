// Server-side style catalog. The frontend only sends a styleId; the actual
// generation prompt lives here so clients can never inject arbitrary prompts.
// Keep ids in sync with src/constants/styles.ts.

export interface StylePrompt {
  id: string
  prompt: string
}

export const STYLE_PROMPTS: Record<string, string> = {
  'pixel-art': 'a detailed 8-bit pixel art portrait',
  anime: 'an anime hero portrait',
  medieval: 'a magical medieval fantasy portrait',
  cyberpunk: 'a cyberpunk futuristic portrait with neon lighting',
  comic: 'a comic book superhero portrait',
  'oil-painting': 'a realistic classic oil painting portrait',
}

export const SYSTEM_PROMPT = [
  'You are an expert AI portrait artist.',
  'Preserve facial identity, pose and proportions.',
  'Apply the requested artistic style.',
  'Generate a high quality portrait.',
].join(' ')

export function buildUserPrompt(stylePrompt: string): string {
  return [
    `Transform this selfie into: ${stylePrompt}.`,
    'Requirements:',
    '- Keep facial identity recognizable',
    '- High quality',
    '- Detailed',
    '- Artistic',
    '- No text',
    '- No watermark',
  ].join('\n')
}
