<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  agentToEdit: { type: Object, default: null },
})

const emit = defineEmits(['close', 'save'])

const EMPTY_FORM = () => ({
  name: '',
  icon: '',
  category: 'Testing',
  status: 'active',
  purpose: '',
  tools: '',
  trigger: '',
  tags: '',
  notes: '',
})

const form = ref(EMPTY_FORM())

watch(
  () => [props.isOpen, props.agentToEdit],
  ([isOpen, agent]) => {
    if (!isOpen) return
    if (agent) {
      form.value = {
        name: agent.name ?? '',
        icon: agent.icon ?? '',
        category: agent.category ?? 'Testing',
        status: agent.status ?? 'active',
        purpose: agent.purpose ?? '',
        tools: agent.tools ?? '',
        trigger: agent.trigger ?? '',
        tags: (agent.tags ?? []).join(', '),
        notes: agent.notes ?? '',
      }
    } else {
      form.value = EMPTY_FORM()
    }
  }
)

function handleSave() {
  if (!form.value.name.trim() || !form.value.purpose.trim()) {
    alert('Name and Purpose are required.')
    return
  }
  emit('save', {
    ...form.value,
    icon: form.value.icon.trim() || '🤖',
    tags: form.value.tags.split(',').map(t => t.trim()).filter(Boolean),
  })
}

function handleOverlayClick(e) {
  if (e.target === e.currentTarget) emit('close')
}
</script>

<template>
  <div class="overlay" :class="{ open: isOpen }" @click="handleOverlayClick">
    <div class="modal">
      <h2>{{ agentToEdit ? 'Edit Agent' : 'Add Agent' }}</h2>

      <div class="field">
        <label>Name *</label>
        <input v-model="form.name" type="text" placeholder="e.g. Test Generator" />
      </div>

      <div class="field">
        <label>Icon (emoji)</label>
        <input v-model="form.icon" type="text" placeholder="🤖" maxlength="4" />
      </div>

      <div class="field">
        <label>Category</label>
        <select v-model="form.category">
          <option>Testing</option>
          <option>Code Quality</option>
          <option>Exploration</option>
          <option>Documentation</option>
          <option>Infrastructure</option>
          <option>Security</option>
          <option>General</option>
        </select>
      </div>

      <div class="field">
        <label>Status</label>
        <select v-model="form.status">
          <option value="active">Active</option>
          <option value="experimental">Experimental</option>
          <option value="deprecated">Deprecated</option>
        </select>
      </div>

      <div class="field">
        <label>Purpose *</label>
        <textarea v-model="form.purpose" placeholder="What does this agent do?"></textarea>
      </div>

      <div class="field">
        <label>Tools / Capabilities</label>
        <input v-model="form.tools" type="text" placeholder="e.g. Read, Grep, Bash (comma separated)" />
      </div>

      <div class="field">
        <label>Trigger / When to use</label>
        <input v-model="form.trigger" type="text" placeholder="e.g. When you need to find files quickly" />
      </div>

      <div class="field">
        <label>Tags (comma separated)</label>
        <input v-model="form.tags" type="text" placeholder="e.g. testing, automation, fast" />
      </div>

      <div class="field">
        <label>Notes</label>
        <textarea v-model="form.notes" placeholder="Any extra context, limitations, or tips…"></textarea>
      </div>

      <div class="modal-footer">
        <button class="btn btn-ghost" @click="$emit('close')">Cancel</button>
        <button class="btn btn-primary" @click="handleSave">Save Agent</button>
      </div>
    </div>
  </div>
</template>
