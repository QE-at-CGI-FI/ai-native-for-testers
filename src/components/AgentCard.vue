<script setup>
import { computed } from 'vue'
import { colorFor } from '../data/defaultAgents.js'

const props = defineProps({
  agent: { type: Object, required: true },
})

const emit = defineEmits(['edit', 'delete'])

const statusClass = computed(() => ({
  active: 'status-active',
  experimental: 'status-experimental',
  deprecated: 'status-deprecated',
}[props.agent.status] ?? 'status-active'))

const statusLabel = computed(() => ({
  active: 'Active',
  experimental: 'Experimental',
  deprecated: 'Deprecated',
}[props.agent.status] ?? props.agent.status))

const iconBg = computed(() => colorFor(props.agent.name))
</script>

<template>
  <div class="card">
    <div class="card-header">
      <div class="card-icon" :style="{ background: iconBg }">{{ agent.icon || '🤖' }}</div>
      <div class="card-title-block">
        <div class="card-name">{{ agent.name }}</div>
        <div class="card-category">{{ agent.category }}</div>
      </div>
      <div class="card-actions">
        <button class="icon-btn" title="Edit" @click="$emit('edit', agent.id)">✏️</button>
        <button class="icon-btn" title="Delete" @click="$emit('delete', agent.id)">🗑️</button>
      </div>
    </div>

    <span class="status-badge" :class="statusClass">
      <span class="dot"></span>{{ statusLabel }}
    </span>

    <div class="card-desc">{{ agent.purpose }}</div>

    <div class="card-meta">
      <div v-if="agent.tools" class="meta-row">
        <span class="meta-key">Tools</span>
        <span class="meta-val">{{ agent.tools }}</span>
      </div>
      <div v-if="agent.trigger" class="meta-row">
        <span class="meta-key">Trigger</span>
        <span class="meta-val">{{ agent.trigger }}</span>
      </div>
      <div v-if="agent.notes" class="meta-row">
        <span class="meta-key">Notes</span>
        <span class="meta-val">{{ agent.notes }}</span>
      </div>
    </div>

    <div v-if="agent.tags && agent.tags.length" class="tags">
      <span v-for="tag in agent.tags" :key="tag" class="tag">{{ tag }}</span>
    </div>
  </div>
</template>
