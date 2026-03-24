// spec: tests/plan.md § 5. Deleting an Agent
// seed: tests/seed.ts
import { test, expect } from '@playwright/test'
import { seedAgents, cardByName } from './seed'

test.describe('Deleting an Agent', () => {
  test.beforeEach(async ({ page }) => {
    await seedAgents(page)
    await page.goto('/')
  })

  test('5.1 confirming delete removes the card', async ({ page }) => {
    // Accept confirm dialog and delete Delta Security
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain('Delta Security')
      await dialog.accept()
    })
    await cardByName(page, 'Delta Security').locator('button[title="Delete"]').click()

    // Card removed, total drops to 4
    await expect(page.locator('.card')).toHaveCount(4)
    await expect(cardByName(page, 'Delta Security')).not.toBeAttached()
    await expect(page.locator('.stat', { hasText: 'Total Agents' }).locator('.stat-value')).toHaveText('4')
  })

  test('5.2 cancelling delete leaves card intact', async ({ page }) => {
    // Dismiss confirm dialog
    page.on('dialog', async (dialog) => {
      await dialog.dismiss()
    })
    await cardByName(page, 'Delta Security').locator('button[title="Delete"]').click()

    // Card and count unchanged
    await expect(page.locator('.card')).toHaveCount(5)
    await expect(cardByName(page, 'Delta Security')).toBeVisible()
  })

  test('5.3 deletion persists after page reload', async ({ page }) => {
    // Delete Beta Explorer and reload
    page.on('dialog', async (dialog) => dialog.accept())
    await cardByName(page, 'Beta Explorer').locator('button[title="Delete"]').click()
    await expect(page.locator('.card')).toHaveCount(4)

    await page.reload()
    await expect(page.locator('.card')).toHaveCount(4)
    await expect(cardByName(page, 'Beta Explorer')).not.toBeAttached()
  })

  test('5.4 deleting last agent in a category removes that filter chip', async ({ page }) => {
    // Delta Security is the only Security agent
    await expect(page.locator('.filter-chip', { hasText: 'Security' })).toBeVisible()

    page.on('dialog', async (dialog) => dialog.accept())
    await cardByName(page, 'Delta Security').locator('button[title="Delete"]').click()

    // Security chip is gone
    await expect(page.locator('.filter-chip', { hasText: 'Security' })).not.toBeAttached()
  })

  test('5.5 deleting all agents shows empty state', async ({ page, context }) => {
    // Override localStorage with a single agent
    const singleAgent = [{
      id: 'solo-001', name: 'Solo Agent', icon: '🤖', category: 'General',
      status: 'active', purpose: 'The only agent.', tools: '', trigger: '', tags: [], notes: '',
    }]
    await context.addInitScript((d) => {
      localStorage.setItem('agent-inventory', d)
    }, JSON.stringify(singleAgent))
    await page.goto('/')

    await expect(page.locator('.card')).toHaveCount(1)

    page.on('dialog', async (dialog) => dialog.accept())
    await cardByName(page, 'Solo Agent').locator('button[title="Delete"]').click()

    // Empty state visible, total = 0
    await expect(page.locator('.card')).toHaveCount(0)
    await expect(page.locator('.empty-state')).toBeVisible()
    await expect(page.locator('.stat', { hasText: 'Total Agents' }).locator('.stat-value')).toHaveText('0')
  })
})
