import { describe, expect, it } from 'vitest'
import { getStatusTheme, getSeverityTheme } from './trackerUtils.js'

describe('tracker utilities', () => {
  it('returns a blue theme for active staff', () => {
    const theme = getStatusTheme('active')

    expect(theme.badge).toContain('bg-sky-500/10')
    expect(theme.text).toContain('text-sky-300')
  })

  it('returns a red theme for urgent incidents', () => {
    const theme = getSeverityTheme('urgent')

    expect(theme.badge).toContain('bg-rose-500/10')
    expect(theme.text).toContain('text-rose-300')
  })
})
