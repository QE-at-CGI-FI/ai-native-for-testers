<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import AgentCard from './components/AgentCard.vue'
import AgentModal from './components/AgentModal.vue'
import { uid, DEFAULT_AGENTS } from './data/defaultAgents.js'

// ── State ──────────────────────────────────────────────────────────────────
const agents = ref(loadAgents())
const search = ref('')
const activeFilter = ref('All')
const showModal = ref(false)
const editId = ref(null)
const importInput = ref(null)

// ── Persistence ────────────────────────────────────────────────────────────
function loadAgents() {
  try {
    const raw = localStorage.getItem('agent-inventory')
    if (raw) return JSON.parse(raw)
  } catch (e) {}
  return DEFAULT_AGENTS.map(a => ({ ...a }))
}

function persist() {
  localStorage.setItem('agent-inventory', JSON.stringify(agents.value))
}

// ── Computed ───────────────────────────────────────────────────────────────
const categories = computed(() => ['All', ...new Set(agents.value.map(a => a.category))])

const filteredAgents = computed(() => {
  const q = search.value.toLowerCase()
  return agents.value.filter(a => {
    const matchCat = activeFilter.value === 'All' || a.category === activeFilter.value
    const matchQ = !q || [a.name, a.purpose, a.category, ...(a.tags ?? [])].some(v => v.toLowerCase().includes(q))
    return matchCat && matchQ
  })
})

const stats = computed(() => ({
  total: agents.value.length,
  active: agents.value.filter(a => a.status === 'active').length,
  experimental: agents.value.filter(a => a.status === 'experimental').length,
  categories: new Set(agents.value.map(a => a.category)).size,
}))

const agentToEdit = computed(() => editId.value ? agents.value.find(a => a.id === editId.value) ?? null : null)

// ── Actions ────────────────────────────────────────────────────────────────
function openModal(id = null) {
  editId.value = id
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editId.value = null
}

function saveAgent(formData) {
  const obj = { ...formData, id: editId.value ?? uid() }
  if (editId.value) {
    const idx = agents.value.findIndex(a => a.id === editId.value)
    if (idx > -1) agents.value[idx] = obj
  } else {
    agents.value.push(obj)
  }
  persist()
  closeModal()
}

function deleteAgent(id) {
  const agent = agents.value.find(a => a.id === id)
  if (!confirm(`Delete "${agent?.name}"?`)) return
  agents.value = agents.value.filter(a => a.id !== id)
  persist()
}

function exportAgents() {
  const json = JSON.stringify(agents.value, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `agent-inventory-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function triggerImport() {
  importInput.value?.click()
}

function importAgents(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = evt => {
    try {
      const data = JSON.parse(evt.target.result)
      if (!Array.isArray(data)) throw new Error('Expected a JSON array.')
      const valid = data.filter(a => a.name && a.purpose)
      if (!valid.length) throw new Error('No valid agents found (each needs name + purpose).')

      const merged = confirm(`Found ${valid.length} agent(s).\n\nMerge with existing (OK) or Replace all (Cancel)?`)

      if (merged) {
        valid.forEach(incoming => {
          incoming.id = incoming.id ?? uid()
          const idx = agents.value.findIndex(a => a.name === incoming.name)
          if (idx > -1) agents.value[idx] = incoming
          else agents.value.push(incoming)
        })
      } else {
        agents.value = valid.map(a => ({ ...a, id: a.id ?? uid() }))
      }

      persist()
      alert(`Import complete — ${valid.length} agent(s) loaded.`)
    } catch (err) {
      alert('Import failed: ' + err.message)
    }
    e.target.value = ''
  }
  reader.readAsText(file)
}

// ── Keyboard shortcuts ─────────────────────────────────────────────────────
function onKeydown(e) {
  if (e.key === 'Escape') closeModal()
  if (
    e.key === 'n' && !e.metaKey && !e.ctrlKey &&
    document.activeElement.tagName !== 'INPUT' &&
    document.activeElement.tagName !== 'TEXTAREA'
  ) openModal()
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <header>
    <div class="logo">
      <div class="logo-icon">🤖</div>
      <div>
        <h1>Agent Inventory</h1>
        <p>AI-Native for Testers</p>
      </div>
    </div>
    <div class="header-actions">
      <input
        v-model="search"
        class="search-box"
        type="text"
        placeholder="Search agents…"
      />
      <button class="btn btn-ghost" title="Export all agents as JSON" @click="exportAgents">↓ Export</button>
      <button class="btn btn-ghost" title="Import agents from JSON" @click="triggerImport">↑ Import</button>
      <input ref="importInput" type="file" accept=".json" style="display:none" @change="importAgents" />
      <button class="btn btn-primary" @click="openModal()">+ Add Agent</button>
    </div>
  </header>

  <main>
    <div class="stats-bar">
      <div class="stat">
        <div class="stat-value">{{ stats.total }}</div>
        <div class="stat-label">Total Agents</div>
      </div>
      <div class="stat">
        <div class="stat-value">{{ stats.active }}</div>
        <div class="stat-label">Active</div>
      </div>
      <div class="stat">
        <div class="stat-value">{{ stats.experimental }}</div>
        <div class="stat-label">Experimental</div>
      </div>
      <div class="stat">
        <div class="stat-value">{{ stats.categories }}</div>
        <div class="stat-label">Categories</div>
      </div>
    </div>

    <div class="filter-bar">
      <button
        v-for="cat in categories"
        :key="cat"
        class="filter-chip"
        :class="{ active: activeFilter === cat }"
        @click="activeFilter = cat"
      >{{ cat }}</button>
    </div>

    <div class="grid">
      <template v-if="filteredAgents.length">
        <AgentCard
          v-for="agent in filteredAgents"
          :key="agent.id"
          :agent="agent"
          @edit="openModal"
          @delete="deleteAgent"
        />
      </template>
      <div v-else class="empty-state" style="grid-column: 1 / -1">
        <div class="icon">🔎</div>
        <p>No agents match your search.</p>
      </div>
    </div>
  </main>

  <AgentModal
    :is-open="showModal"
    :agent-to-edit="agentToEdit"
    @close="closeModal"
    @save="saveAgent"
  />
</template>
