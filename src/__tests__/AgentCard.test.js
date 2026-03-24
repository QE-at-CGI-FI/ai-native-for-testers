import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AgentCard from '../components/AgentCard.vue'

const BASE_AGENT = {
  id: 'card-1',
  name: 'Test Agent',
  icon: '🧪',
  category: 'Testing',
  status: 'active',
  purpose: 'Does testing things',
  tools: 'Read, Grep',
  trigger: 'When you need tests',
  notes: 'Handle with care',
  tags: ['testing', 'fast'],
}

function mountCard(overrides = {}) {
  return mount(AgentCard, { props: { agent: { ...BASE_AGENT, ...overrides } } })
}

describe('AgentCard — rendering', () => {
  it('renders the agent name', () => {
    expect(mountCard().text()).toContain('Test Agent')
  })

  it('renders the category', () => {
    expect(mountCard().text()).toContain('Testing')
  })

  it('renders the purpose', () => {
    expect(mountCard().text()).toContain('Does testing things')
  })

  it('renders the icon', () => {
    expect(mountCard().find('.card-icon').text()).toContain('🧪')
  })

  it('falls back to 🤖 when icon is empty', () => {
    expect(mountCard({ icon: '' }).find('.card-icon').text()).toContain('🤖')
  })

  it('sets a background gradient on the icon from colorFor()', () => {
    const style = mountCard().find('.card-icon').attributes('style')
    expect(style).toMatch(/background:.*gradient/)
  })
})

describe('AgentCard — status badge', () => {
  it('shows active badge', () => {
    const wrapper = mountCard({ status: 'active' })
    expect(wrapper.find('.status-active').exists()).toBe(true)
    expect(wrapper.find('.status-active').text()).toContain('Active')
  })

  it('shows experimental badge', () => {
    const wrapper = mountCard({ status: 'experimental' })
    expect(wrapper.find('.status-experimental').exists()).toBe(true)
    expect(wrapper.find('.status-experimental').text()).toContain('Experimental')
  })

  it('shows deprecated badge', () => {
    const wrapper = mountCard({ status: 'deprecated' })
    expect(wrapper.find('.status-deprecated').exists()).toBe(true)
    expect(wrapper.find('.status-deprecated').text()).toContain('Deprecated')
  })

  it('falls back to active badge for unknown status', () => {
    const wrapper = mountCard({ status: 'unknown' })
    expect(wrapper.find('.status-active').exists()).toBe(true)
  })
})

describe('AgentCard — meta rows', () => {
  it('renders tools, trigger and notes', () => {
    const wrapper = mountCard()
    expect(wrapper.text()).toContain('Read, Grep')
    expect(wrapper.text()).toContain('When you need tests')
    expect(wrapper.text()).toContain('Handle with care')
    expect(wrapper.findAll('.meta-row').length).toBe(3)
  })

  it('omits tools row when tools is empty', () => {
    const wrapper = mountCard({ tools: '' })
    expect(wrapper.findAll('.meta-row').length).toBe(2)
  })

  it('omits trigger row when trigger is empty', () => {
    const wrapper = mountCard({ trigger: '' })
    expect(wrapper.findAll('.meta-row').length).toBe(2)
  })

  it('omits notes row when notes is empty', () => {
    const wrapper = mountCard({ notes: '' })
    expect(wrapper.findAll('.meta-row').length).toBe(2)
  })

  it('renders no meta rows when all optional fields are empty', () => {
    const wrapper = mountCard({ tools: '', trigger: '', notes: '' })
    expect(wrapper.findAll('.meta-row').length).toBe(0)
  })
})

describe('AgentCard — tags', () => {
  it('renders each tag as a .tag span', () => {
    const wrapper = mountCard()
    const tags = wrapper.findAll('.tag')
    expect(tags.length).toBe(2)
    expect(tags[0].text()).toBe('testing')
    expect(tags[1].text()).toBe('fast')
  })

  it('does not render the .tags container when tags array is empty', () => {
    expect(mountCard({ tags: [] }).find('.tags').exists()).toBe(false)
  })
})

describe('AgentCard — events', () => {
  it('emits edit with agent id when edit button is clicked', async () => {
    const wrapper = mountCard()
    await wrapper.find('button[title="Edit"]').trigger('click')
    expect(wrapper.emitted('edit')).toEqual([['card-1']])
  })

  it('emits delete with agent id when delete button is clicked', async () => {
    const wrapper = mountCard()
    await wrapper.find('button[title="Delete"]').trigger('click')
    expect(wrapper.emitted('delete')).toEqual([['card-1']])
  })
})
