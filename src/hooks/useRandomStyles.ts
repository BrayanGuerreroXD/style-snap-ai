import { useMemo, useState } from 'react'
import { STYLES, STYLE_CHOICES, type Style } from '@/constants/styles'
import { shuffle } from '@/utils/shuffle'

/**
 * Picks `STYLE_CHOICES` random styles. `seed` lets the caller force a reshuffle
 * (e.g. on each new capture) by changing the value.
 */
export function useRandomStyles(seed: number): Style[] {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => shuffle(STYLES).slice(0, STYLE_CHOICES), [seed])
}

/** Convenience hook bundling the reshuffle counter with the selection. */
export function useStyleSelection() {
  const [seed, setSeed] = useState(0)
  const styles = useRandomStyles(seed)
  const reshuffle = () => setSeed((s) => s + 1)
  return { styles, reshuffle }
}
