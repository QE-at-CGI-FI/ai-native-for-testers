import { vi } from 'vitest'

// Suppress jsdom "Not implemented: navigation" warning from download anchor clicks
HTMLAnchorElement.prototype.click = vi.fn()

// URL.createObjectURL / revokeObjectURL not implemented in jsdom
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
global.URL.revokeObjectURL = vi.fn()

// Replace jsdom's localStorage with a reliable in-memory mock

const store = {}

const localStorageMock = {
  getItem: (key) => Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null,
  setItem: (key, val) => { store[key] = String(val) },
  removeItem: (key) => { delete store[key] },
  clear: () => { Object.keys(store).forEach(k => delete store[k]) },
  get length() { return Object.keys(store).length },
  key: (i) => Object.keys(store)[i] ?? null,
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})
