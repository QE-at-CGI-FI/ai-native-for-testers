import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import App from '../App.vue'

// ── Fixtures ───────────────────────────────────────────────────────────────
const AGENTS = [
  {
    id: '1', name: 'Alpha Agent', icon: '🅰️', category: 'Testing',
    status: 'active', purpose: 'Does alpha things', tools: 'Read',
    trigger: 'On alpha', tags: ['alpha'], notes: '',
  },
  {
    id: '2', name: 'Beta Agent', icon: '🅱️', category: 'General',
    status: 'experimental', purpose: 'Does beta things', tools: '',
    trigger: '', tags: ['beta'], notes: '',
  },
  {
    id: '3', name: 'Gamma Agent', icon: '🔤', category: 'Testing',
    status: 'deprecated', purpose: 'Does gamma things', tools: '',
    trigger: '', tags: [], notes: 'Old agent',
  },
]

function mountApp(agents = AGENTS) {
  localStorage.setItem('agent-inventory', JSON.stringify(agents))
  return mount(App)
}

// ── Setup ──────────────────────────────────────────────────────────────────
beforeEach(() => {
  localStorage.clear()
  vi.spyOn(window, 'alert').mockImplementation(() => {})
  vi.spyOn(window, 'confirm').mockImplementation(() => true)
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ── Stats ──────────────────────────────────────────────────────────────────
describe('Stats bar', () => {
  it('shows correct total count', () => {
    const vals = mountApp().findAll('.stat-value')
    expect(vals[0].text()).toBe('3')
  })

  it('shows correct active count', () => {
    const vals = mountApp().findAll('.stat-value')
    expect(vals[1].text()).toBe('1')
  })

  it('shows correct experimental count', () => {
    const vals = mountApp().findAll('.stat-value')
    expect(vals[2].text()).toBe('1')
  })

  it('shows correct category count', () => {
    const vals = mountApp().findAll('.stat-value') // Testing + General = 2
    expect(vals[3].text()).toBe('2')
  })

  it('updates stats after adding an agent', async () => {
    const wrapper = mountApp()
    await wrapper.find('.btn-primary').trigger('click')
    const modal = wrapper.find('.modal')
    await modal.findAll('input')[0].setValue('New One')
    await modal.findAll('textarea')[0].setValue('New purpose')
    await modal.find('.btn-primary').trigger('click')
    expect(wrapper.findAll('.stat-value')[0].text()).toBe('4')
  })
})

// ── Filter chips ───────────────────────────────────────────────────────────
describe('Category filter', () => {
  it('renders All plus one chip per unique category', () => {
    const chips = mountApp().findAll('.filter-chip')
    const labels = chips.map(c => c.text())
    expect(labels).toContain('All')
    expect(labels).toContain('Testing')
    expect(labels).toContain('General')
  })

  it('All chip is active by default', () => {
    const all = mountApp().findAll('.filter-chip').find(c => c.text() === 'All')
    expect(all.classes()).toContain('active')
  })

  it('filters to selected category', async () => {
    const wrapper = mountApp()
    const chip = wrapper.findAll('.filter-chip').find(c => c.text() === 'Testing')
    await chip.trigger('click')
    expect(wrapper.findAll('.card').length).toBe(2)
  })

  it('selected chip gets active class', async () => {
    const wrapper = mountApp()
    const chip = wrapper.findAll('.filter-chip').find(c => c.text() === 'General')
    await chip.trigger('click')
    expect(chip.classes()).toContain('active')
  })

  it('clicking All restores full list', async () => {
    const wrapper = mountApp()
    const chips = wrapper.findAll('.filter-chip')
    await chips.find(c => c.text() === 'Testing').trigger('click')
    await chips.find(c => c.text() === 'All').trigger('click')
    expect(wrapper.findAll('.card').length).toBe(3)
  })
})

// ── Search ─────────────────────────────────────────────────────────────────
describe('Search', () => {
  it('filters by agent name', async () => {
    const wrapper = mountApp()
    await wrapper.find('.search-box').setValue('alpha')
    expect(wrapper.findAll('.card').length).toBe(1)
  })

  it('filters by purpose text', async () => {
    const wrapper = mountApp()
    await wrapper.find('.search-box').setValue('beta things')
    expect(wrapper.findAll('.card').length).toBe(1)
  })

  it('filters by tag', async () => {
    const wrapper = mountApp()
    await wrapper.find('.search-box').setValue('beta')  // tag on Beta Agent
    expect(wrapper.findAll('.card').length).toBe(1)
  })

  it('is case-insensitive', async () => {
    const wrapper = mountApp()
    await wrapper.find('.search-box').setValue('ALPHA')
    expect(wrapper.findAll('.card').length).toBe(1)
  })

  it('shows empty state when nothing matches', async () => {
    const wrapper = mountApp()
    await wrapper.find('.search-box').setValue('zzznomatch')
    expect(wrapper.find('.empty-state').exists()).toBe(true)
    expect(wrapper.findAll('.card').length).toBe(0)
  })

  it('restores full list when search is cleared', async () => {
    const wrapper = mountApp()
    await wrapper.find('.search-box').setValue('alpha')
    await wrapper.find('.search-box').setValue('')
    expect(wrapper.findAll('.card').length).toBe(3)
  })
})

// ── Add agent ──────────────────────────────────────────────────────────────
describe('Adding an agent', () => {
  it('opens the modal when + Add Agent is clicked', async () => {
    const wrapper = mountApp()
    await wrapper.find('.btn-primary').trigger('click')
    expect(wrapper.find('.overlay').classes()).toContain('open')
  })

  it('modal title is "Add Agent"', async () => {
    const wrapper = mountApp()
    await wrapper.find('.btn-primary').trigger('click')
    expect(wrapper.find('h2').text()).toBe('Add Agent')
  })

  it('adds the agent to the grid', async () => {
    const wrapper = mountApp()
    await wrapper.find('.btn-primary').trigger('click')
    const modal = wrapper.find('.modal')
    await modal.findAll('input')[0].setValue('Zeta Agent')
    await modal.findAll('textarea')[0].setValue('Zeta purpose')
    await modal.find('.btn-primary').trigger('click')
    expect(wrapper.findAll('.card').length).toBe(4)
    expect(wrapper.text()).toContain('Zeta Agent')
  })

  it('persists the new agent to localStorage', async () => {
    const wrapper = mountApp()
    await wrapper.find('.btn-primary').trigger('click')
    const modal = wrapper.find('.modal')
    await modal.findAll('input')[0].setValue('Persisted Agent')
    await modal.findAll('textarea')[0].setValue('Persisted purpose')
    await modal.find('.btn-primary').trigger('click')

    const stored = JSON.parse(localStorage.getItem('agent-inventory'))
    expect(stored.some(a => a.name === 'Persisted Agent')).toBe(true)
  })

  it('closes the modal after saving', async () => {
    const wrapper = mountApp()
    await wrapper.find('.btn-primary').trigger('click')
    const modal = wrapper.find('.modal')
    await modal.findAll('input')[0].setValue('Agent X')
    await modal.findAll('textarea')[0].setValue('Purpose X')
    await modal.find('.btn-primary').trigger('click')
    expect(wrapper.find('.overlay').classes()).not.toContain('open')
  })

  it('does not add agent when name is missing', async () => {
    const wrapper = mountApp()
    await wrapper.find('.btn-primary').trigger('click')
    const modal = wrapper.find('.modal')
    await modal.findAll('textarea')[0].setValue('Some purpose')
    await modal.find('.btn-primary').trigger('click')
    expect(wrapper.findAll('.card').length).toBe(3)
  })
})

// ── Edit agent ─────────────────────────────────────────────────────────────
describe('Editing an agent', () => {
  it('opens modal with "Edit Agent" title', async () => {
    const wrapper = mountApp()
    await wrapper.findAll('button[title="Edit"]')[0].trigger('click')
    expect(wrapper.find('h2').text()).toBe('Edit Agent')
  })

  it('pre-fills the name field with existing agent name', async () => {
    const wrapper = mountApp()
    await wrapper.findAll('button[title="Edit"]')[0].trigger('click')
    expect(wrapper.find('.modal').findAll('input')[0].element.value).toBe('Alpha Agent')
  })

  it('updates the agent in the grid after saving', async () => {
    const wrapper = mountApp()
    await wrapper.findAll('button[title="Edit"]')[0].trigger('click')
    const modal = wrapper.find('.modal')
    await modal.findAll('input')[0].setValue('Alpha Edited')
    await modal.find('.btn-primary').trigger('click')
    expect(wrapper.text()).toContain('Alpha Edited')
    expect(wrapper.text()).not.toContain('Alpha Agent')
  })

  it('persists the edit to localStorage', async () => {
    const wrapper = mountApp()
    await wrapper.findAll('button[title="Edit"]')[0].trigger('click')
    const modal = wrapper.find('.modal')
    await modal.findAll('input')[0].setValue('Alpha Edited')
    await modal.find('.btn-primary').trigger('click')

    const stored = JSON.parse(localStorage.getItem('agent-inventory'))
    expect(stored.find(a => a.id === '1').name).toBe('Alpha Edited')
  })

  it('does not change total count after editing', async () => {
    const wrapper = mountApp()
    await wrapper.findAll('button[title="Edit"]')[0].trigger('click')
    const modal = wrapper.find('.modal')
    await modal.findAll('input')[0].setValue('Alpha Edited')
    await modal.find('.btn-primary').trigger('click')
    expect(wrapper.findAll('.card').length).toBe(3)
  })
})

// ── Delete agent ───────────────────────────────────────────────────────────
describe('Deleting an agent', () => {
  it('removes the agent from the grid when confirmed', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const wrapper = mountApp()
    await wrapper.findAll('button[title="Delete"]')[0].trigger('click')
    expect(wrapper.findAll('.card').length).toBe(2)
  })

  it('does not remove the agent when confirm is cancelled', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    const wrapper = mountApp()
    await wrapper.findAll('button[title="Delete"]')[0].trigger('click')
    expect(wrapper.findAll('.card').length).toBe(3)
  })

  it('persists the deletion to localStorage', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const wrapper = mountApp()
    await wrapper.findAll('button[title="Delete"]')[0].trigger('click')
    const stored = JSON.parse(localStorage.getItem('agent-inventory'))
    expect(stored.find(a => a.id === '1')).toBeUndefined()
  })
})

// ── Modal close ────────────────────────────────────────────────────────────
describe('Modal close', () => {
  it('closes on Cancel button click', async () => {
    const wrapper = mountApp()
    await wrapper.find('.btn-primary').trigger('click')
    await wrapper.find('.modal-footer .btn-ghost').trigger('click')
    expect(wrapper.find('.overlay').classes()).not.toContain('open')
  })

  it('closes on Escape keydown', async () => {
    const wrapper = mountApp()
    await wrapper.find('.btn-primary').trigger('click')
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()
    expect(wrapper.find('.overlay').classes()).not.toContain('open')
  })
})

// ── Export ─────────────────────────────────────────────────────────────────
describe('Export', () => {
  it('calls URL.createObjectURL when Export is clicked', async () => {
    const wrapper = mountApp()
    await wrapper.findAll('.btn-ghost')[0].trigger('click')
    expect(URL.createObjectURL).toHaveBeenCalled()
  })

  it('calls URL.revokeObjectURL to clean up', async () => {
    const wrapper = mountApp()
    await wrapper.findAll('.btn-ghost')[0].trigger('click')
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
  })
})

// ── Import ─────────────────────────────────────────────────────────────────
describe('Import', () => {
  it('triggers the hidden file input when Import is clicked', async () => {
    const wrapper = mountApp()
    const fileInput = wrapper.find('input[type="file"]')
    const clickSpy = vi.spyOn(fileInput.element, 'click').mockImplementation(() => {})
    await wrapper.findAll('.btn-ghost')[1].trigger('click')
    expect(clickSpy).toHaveBeenCalled()
  })
})

// ── Keyboard shortcuts ─────────────────────────────────────────────────────
describe('Keyboard shortcuts', () => {
  it('opens modal on n keypress when focus is not on an input', async () => {
    const wrapper = mountApp()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'n' }))
    await nextTick()
    expect(wrapper.find('.overlay').classes()).toContain('open')
  })

  it('does not open modal on n keypress when an input is focused', async () => {
    const wrapper = mountApp()
    await wrapper.find('.search-box').trigger('focus')
    Object.defineProperty(document, 'activeElement', {
      value: wrapper.find('.search-box').element,
      configurable: true,
    })
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'n' }))
    await nextTick()
    expect(wrapper.find('.overlay').classes()).not.toContain('open')
    Object.defineProperty(document, 'activeElement', { value: document.body, configurable: true })
  })
})

// ── localStorage fallback ──────────────────────────────────────────────────
describe('localStorage', () => {
  it('loads default agents when localStorage is empty', () => {
    localStorage.clear()
    const wrapper = mount(App)
    expect(wrapper.findAll('.card').length).toBeGreaterThan(0)
  })

  it('loads agents from localStorage when present', () => {
    const wrapper = mountApp([AGENTS[0]])
    expect(wrapper.findAll('.card').length).toBe(1)
    expect(wrapper.text()).toContain('Alpha Agent')
  })
})
