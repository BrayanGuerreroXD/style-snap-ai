import { describe, it, expect } from 'vitest'
import { STYLES, STYLES_BY_ID, STYLE_CHOICES } from './styles'

describe('styles catalog', () => {
  it('has at least STYLE_CHOICES styles to pick from', () => {
    expect(STYLES.length).toBeGreaterThanOrEqual(STYLE_CHOICES)
  })

  it('has unique ids', () => {
    const ids = STYLES.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('indexes every style by id', () => {
    STYLES.forEach((s) => expect(STYLES_BY_ID[s.id]).toBe(s))
  })
})
