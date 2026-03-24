import { describe, it, expect } from 'vitest'
import { uid, colorFor, COLOR_POOLS, DEFAULT_AGENTS } from '../data/defaultAgents.js'

describe('uid()', () => {
  it('returns a non-empty string', () => {
    expect(typeof uid()).toBe('string')
    expect(uid().length).toBeGreaterThan(0)
  })

  it('returns unique values across many calls', () => {
    const ids = new Set(Array.from({ length: 100 }, () => uid()))
    expect(ids.size).toBe(100)
  })
})

describe('colorFor()', () => {
  it('returns a value from COLOR_POOLS', () => {
    expect(COLOR_POOLS).toContain(colorFor('General Purpose'))
  })

  it('is deterministic — same name yields same color', () => {
    expect(colorFor('Explore')).toBe(colorFor('Explore'))
    expect(colorFor('Plan')).toBe(colorFor('Plan'))
  })

  it('produces different colors for different names', () => {
    const names = ['General Purpose', 'Explore', 'Plan', 'Test Generator', 'Bug Finder']
    const colors = new Set(names.map(colorFor))
    expect(colors.size).toBeGreaterThan(1)
  })

  it('handles single-character names without throwing', () => {
    expect(() => colorFor('A')).not.toThrow()
    expect(COLOR_POOLS).toContain(colorFor('A'))
  })

  it('handles empty string without throwing', () => {
    expect(() => colorFor('')).not.toThrow()
  })
})

describe('DEFAULT_AGENTS', () => {
  it('contains at least one agent', () => {
    expect(DEFAULT_AGENTS.length).toBeGreaterThan(0)
  })

  it('every agent has the required fields', () => {
    for (const agent of DEFAULT_AGENTS) {
      expect(agent.id, `${agent.name} missing id`).toBeTruthy()
      expect(agent.name, `agent missing name`).toBeTruthy()
      expect(agent.purpose, `${agent.name} missing purpose`).toBeTruthy()
      expect(agent.category, `${agent.name} missing category`).toBeTruthy()
      expect(agent.status, `${agent.name} missing status`).toBeTruthy()
      expect(Array.isArray(agent.tags), `${agent.name} tags must be array`).toBe(true)
    }
  })

  it('all agent ids are unique', () => {
    const ids = DEFAULT_AGENTS.map(a => a.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('all statuses are valid values', () => {
    const valid = new Set(['active', 'experimental', 'deprecated'])
    for (const agent of DEFAULT_AGENTS) {
      expect(valid.has(agent.status), `${agent.name} has invalid status: ${agent.status}`).toBe(true)
    }
  })

  it('contains expected well-known agents', () => {
    const names = DEFAULT_AGENTS.map(a => a.name)
    expect(names).toContain('General Purpose')
    expect(names).toContain('Explore')
    expect(names).toContain('Plan')
  })
})
