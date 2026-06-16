/**
 * Closed list of artistic styles. The frontend shows names/icons and sends only
 * the `id` to the Edge Function — the real generation prompt lives server-side.
 * Keep `id`s in sync with supabase/functions/generate-image/styles.ts.
 */

export interface Style {
  id: string
  name: string
  /** Emoji icon used in the StyleCard, matching the Stitch mockups. */
  icon: string
  /** Short tagline shown under the name. */
  tagline: string
}

export const STYLES: Style[] = [
  { id: 'pixel-art', name: 'Pixel Hero', icon: '👾', tagline: 'Retro 8-bit' },
  { id: 'anime', name: 'Anime Warrior', icon: '🗡️', tagline: 'Anime hero' },
  { id: 'medieval', name: 'Medieval Mage', icon: '🪄', tagline: 'Fantasy magic' },
  { id: 'cyberpunk', name: 'Cyberpunk Rebel', icon: '🤖', tagline: 'Neon future' },
  { id: 'comic', name: 'Comic Legend', icon: '💥', tagline: 'Comic hero' },
  { id: 'oil-painting', name: 'Classic Masterpiece', icon: '🎨', tagline: 'Oil painting' },
]

export const STYLES_BY_ID: Record<string, Style> = Object.fromEntries(
  STYLES.map((s) => [s.id, s]),
)

/** Number of random styles presented to the user after capture. */
export const STYLE_CHOICES = 3
