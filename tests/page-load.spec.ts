// spec: tests/plan.md § 1. Page Load and Initial State
// seed: tests/seed.ts
import { test, expect } from '@playwright/test'
import { seedAgents, cardByName } from './seed'

test.describe('Page Load and Initial State', () => {
  test.beforeEach(async ({ page }) => {
    await seedAgents(page)
    await page.goto('/')
  })

  test('1.1 header and branding render correctly', async ({ page }) => {
    // Observe the header section
    await expect(page.locator('header .logo-icon')).toBeVisible()
    await expect(page.locator('h1')).toHaveText('Agent Inventory')
    await expect(page.locator('header p')).toHaveText('AI-Native for Testers')
  })

  test('1.2 stats bar reflects seed data counts', async ({ page }) => {
    // Read each stat value
    const stats = page.locator('.stat')
    await expect(stats.filter({ hasText: 'Total Agents' }).locator('.stat-value')).toHaveText('5')
    await expect(stats.filter({ hasText: 'Active' }).locator('.stat-value')).toHaveText('3')
    await expect(stats.filter({ hasText: 'Experimental' }).locator('.stat-value')).toHaveText('1')
    await expect(stats.filter({ hasText: 'Categories' }).locator('.stat-value')).toHaveText('5')
  })

  test('1.3 agent grid renders all five seed cards', async ({ page }) => {
    // Count cards and verify each agent name is visible
    await expect(page.locator('.card')).toHaveCount(5)
    for (const name of ['Alpha Tester', 'Beta Explorer', 'Gamma Docs', 'Delta Security', 'Epsilon Infra']) {
      await expect(cardByName(page, name)).toBeVisible()
    }
    await expect(page.locator('.empty-state')).not.toBeVisible()
  })

  test('1.4 filter chips render all categories plus "All"', async ({ page }) => {
    // Read filter chip labels
    const chips = page.locator('.filter-chip')
    await expect(chips).toHaveCount(6)
    for (const label of ['All', 'Testing', 'Exploration', 'Documentation', 'Security', 'Infrastructure']) {
      await expect(chips.filter({ hasText: label })).toBeVisible()
    }
    // "All" chip has active state by default
    await expect(chips.filter({ hasText: 'All' })).toHaveClass(/active/)
  })

  test('1.5 modal is closed on initial load', async ({ page }) => {
    // Check overlay visibility
    await expect(page.locator('.overlay')).not.toHaveClass(/open/)
  })

  test('1.6 agent cards show correct status badges', async ({ page }) => {
    // Check badges on Alpha Tester, Beta Explorer, Delta Security cards
    await expect(cardByName(page, 'Alpha Tester').locator('.status-badge')).toHaveText(/Active/)
    await expect(cardByName(page, 'Beta Explorer').locator('.status-badge')).toHaveText(/Experimental/)
    await expect(cardByName(page, 'Delta Security').locator('.status-badge')).toHaveText(/Deprecated/)
  })

  test('1.7 agent card displays tags', async ({ page }) => {
    // Check tags on Alpha Tester card
    const card = cardByName(page, 'Alpha Tester')
    await expect(card.locator('.tag', { hasText: 'automation' })).toBeVisible()
    await expect(card.locator('.tag', { hasText: 'pr' })).toBeVisible()
  })

  test('1.8 agent card displays metadata fields', async ({ page }) => {
    // Check Tools, Trigger, Notes on Alpha Tester card
    const card = cardByName(page, 'Alpha Tester')
    await expect(card).toContainText('Read, Bash')
    await expect(card).toContainText('On every PR')
    await expect(card).toContainText('Requires CI access.')
  })
})
