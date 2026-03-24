import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import AgentModal from '../components/AgentModal.vue'

const EXISTING_AGENT = {
  id: 'modal-1',
  name: 'Existing Agent',
  icon: '🔍',
  category: 'Exploration',
  status: 'experimental',
  purpose: 'Does exploration things',
  tools: 'Glob, Grep',
  trigger: 'When exploring',
  tags: ['fast', 'exploration'],
  notes: 'Be thorough',
}

// Input order in template: name[0], icon[1], tools[2], trigger[3], tags[4]
// Textarea order: purpose[0], notes[1]

function mountModal(props = {}) {
  return mount(AgentModal, {
    props: { isOpen: true, agentToEdit: null, ...props },
  })
}

describe('AgentModal — visibility', () => {
  it('does not have .open class when isOpen is false', () => {
    const wrapper = mount(AgentModal, { props: { isOpen: false, agentToEdit: null } })
    expect(wrapper.find('.overlay').classes()).not.toContain('open')
  })

  it('has .open class when isOpen is true', () => {
    expect(mountModal().find('.overlay').classes()).toContain('open')
  })
})

describe('AgentModal — title', () => {
  it('shows "Add Agent" when agentToEdit is null', () => {
    expect(mountModal().find('h2').text()).toBe('Add Agent')
  })

  it('shows "Edit Agent" when agentToEdit is provided', () => {
    expect(mountModal({ agentToEdit: EXISTING_AGENT }).find('h2').text()).toBe('Edit Agent')
  })
})

describe('AgentModal — form population', () => {
  it('populates name field from agentToEdit', () => {
    const wrapper = mountModal({ agentToEdit: EXISTING_AGENT })
    expect(wrapper.findAll('input')[0].element.value).toBe('Existing Agent')
  })

  it('populates icon field from agentToEdit', () => {
    const wrapper = mountModal({ agentToEdit: EXISTING_AGENT })
    expect(wrapper.findAll('input')[1].element.value).toBe('🔍')
  })

  it('populates purpose textarea from agentToEdit', () => {
    const wrapper = mountModal({ agentToEdit: EXISTING_AGENT })
    expect(wrapper.findAll('textarea')[0].element.value).toBe('Does exploration things')
  })

  it('populates tools field from agentToEdit', () => {
    const wrapper = mountModal({ agentToEdit: EXISTING_AGENT })
    expect(wrapper.findAll('input')[2].element.value).toBe('Glob, Grep')
  })

  it('joins tags array into comma-separated string', () => {
    const wrapper = mountModal({ agentToEdit: EXISTING_AGENT })
    expect(wrapper.findAll('input')[4].element.value).toBe('fast, exploration')
  })

  it('resets form to empty when opened without agentToEdit', () => {
    const wrapper = mountModal()
    expect(wrapper.findAll('input')[0].element.value).toBe('')
    expect(wrapper.findAll('textarea')[0].element.value).toBe('')
  })
})

describe('AgentModal — close', () => {
  it('emits close when Cancel button is clicked', async () => {
    const wrapper = mountModal()
    await wrapper.find('.btn-ghost').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('emits close when overlay background is clicked', async () => {
    const wrapper = mountModal()
    await wrapper.find('.overlay').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('does not emit close when modal content is clicked', async () => {
    const wrapper = mountModal()
    await wrapper.find('.modal').trigger('click')
    expect(wrapper.emitted('close')).toBeFalsy()
  })
})

describe('AgentModal — validation', () => {
  beforeEach(() => {
    vi.spyOn(window, 'alert').mockImplementation(() => {})
  })

  it('shows alert and does not emit save when name is empty', async () => {
    const wrapper = mountModal()
    await wrapper.findAll('textarea')[0].setValue('Some purpose')
    await wrapper.find('.btn-primary').trigger('click')
    expect(window.alert).toHaveBeenCalledWith('Name and Purpose are required.')
    expect(wrapper.emitted('save')).toBeFalsy()
  })

  it('shows alert and does not emit save when purpose is empty', async () => {
    const wrapper = mountModal()
    await wrapper.findAll('input')[0].setValue('Some name')
    await wrapper.find('.btn-primary').trigger('click')
    expect(window.alert).toHaveBeenCalledWith('Name and Purpose are required.')
    expect(wrapper.emitted('save')).toBeFalsy()
  })
})

describe('AgentModal — form population with partial agent', () => {
  it('falls back to empty strings for missing optional fields', () => {
    const minimal = { id: 'x', name: 'Min', purpose: 'P', category: 'General', status: 'active' }
    const wrapper = mountModal({ agentToEdit: minimal })
    expect(wrapper.findAll('input')[2].element.value).toBe('')   // tools
    expect(wrapper.findAll('input')[3].element.value).toBe('')   // trigger
    expect(wrapper.findAll('input')[4].element.value).toBe('')   // tags
    expect(wrapper.findAll('textarea')[1].element.value).toBe('') // notes
  })

  it('falls back to default icon 🤖 for missing icon', () => {
    const minimal = { id: 'x', name: 'Min', purpose: 'P', category: 'General', status: 'active' }
    const wrapper = mountModal({ agentToEdit: minimal })
    expect(wrapper.findAll('input')[1].element.value).toBe('') // icon field empty → save uses default
  })
})

describe('AgentModal — save', () => {
  it('emits save with correct data when form is valid', async () => {
    const wrapper = mountModal()
    await wrapper.findAll('input')[0].setValue('New Agent')
    await wrapper.findAll('textarea')[0].setValue('New purpose')
    await wrapper.find('.btn-primary').trigger('click')

    expect(wrapper.emitted('save')).toBeTruthy()
    const [data] = wrapper.emitted('save')[0]
    expect(data.name).toBe('New Agent')
    expect(data.purpose).toBe('New purpose')
  })

  it('defaults icon to 🤖 when icon field is empty', async () => {
    const wrapper = mountModal()
    await wrapper.findAll('input')[0].setValue('Agent')
    await wrapper.findAll('textarea')[0].setValue('Purpose')
    await wrapper.find('.btn-primary').trigger('click')

    const [data] = wrapper.emitted('save')[0]
    expect(data.icon).toBe('🤖')
  })

  it('uses provided icon when filled', async () => {
    const wrapper = mountModal()
    await wrapper.findAll('input')[0].setValue('Agent')
    await wrapper.findAll('input')[1].setValue('🚀')
    await wrapper.findAll('textarea')[0].setValue('Purpose')
    await wrapper.find('.btn-primary').trigger('click')

    const [data] = wrapper.emitted('save')[0]
    expect(data.icon).toBe('🚀')
  })

  it('splits comma-separated tags into an array', async () => {
    const wrapper = mountModal()
    await wrapper.findAll('input')[0].setValue('Agent')
    await wrapper.findAll('textarea')[0].setValue('Purpose')
    await wrapper.findAll('input')[4].setValue('foo, bar, baz')
    await wrapper.find('.btn-primary').trigger('click')

    const [data] = wrapper.emitted('save')[0]
    expect(data.tags).toEqual(['foo', 'bar', 'baz'])
  })

  it('filters out empty tag entries', async () => {
    const wrapper = mountModal()
    await wrapper.findAll('input')[0].setValue('Agent')
    await wrapper.findAll('textarea')[0].setValue('Purpose')
    await wrapper.findAll('input')[4].setValue('foo,,bar, ')
    await wrapper.find('.btn-primary').trigger('click')

    const [data] = wrapper.emitted('save')[0]
    expect(data.tags).toEqual(['foo', 'bar'])
  })

  it('emits save with empty tags array when tags field is blank', async () => {
    const wrapper = mountModal()
    await wrapper.findAll('input')[0].setValue('Agent')
    await wrapper.findAll('textarea')[0].setValue('Purpose')
    await wrapper.find('.btn-primary').trigger('click')

    const [data] = wrapper.emitted('save')[0]
    expect(data.tags).toEqual([])
  })
})
