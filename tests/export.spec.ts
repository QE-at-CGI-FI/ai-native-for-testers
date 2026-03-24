// spec: tests/plan.md § 6. Export Functionality
// seed: tests/seed.ts
import { test, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { seedAgents, SEED_AGENTS, cardByName } from './seed'

test.describe('Export Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await seedAgents(page)
    await page.goto('/')
  })

  test('6.1 export triggers a JSON file download with correct filename', async ({ page }) => {
    // Set up download listener before clicking
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button:has-text("↓ Export")'),
    ])

    // Filename matches agent-inventory-YYYY-MM-DD.json
    expect(download.suggestedFilename()).toMatch(/^agent-inventory-\d{4}-\d{2}-\d{2}\.json$/)
  })

  test('6.2 exported file contains valid JSON matching seed agents', async ({ page }) => {
    // Download and parse file
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button:has-text("↓ Export")'),
    ])
    const filePath = await download.path()
    const content = readFileSync(filePath!, 'utf-8')
    const agents = JSON.parse(content)

    expect(Array.isArray(agents)).toBe(true)
    expect(agents).toHaveLength(5)

    const exportedNames = agents.map((a: { name: string }) => a.name)
    for (const { name } of SEED_AGENTS) {
      expect(exportedNames).toContain(name)
    }
  })

  test('6.3 export reflects agents added during the session', async ({ page }) => {
    // Add a new agent
    await page.click('button:has-text("+ Add Agent")')
    await page.fill('input[placeholder*="Test Generator"]', 'Nu Export Test')
    await page.fill('textarea[placeholder*="What does this agent do"]', 'Verifies export captures new agents.')
    await page.click('button:has-text("Save Agent")')
    await expect(cardByName(page, 'Nu Export Test')).toBeVisible()

    // Export and verify
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button:has-text("↓ Export")'),
    ])
    const content = readFileSync(await download.path()!, 'utf-8')
    const agents = JSON.parse(content)

    expect(agents).toHaveLength(6)
    expect(agents.map((a: { name: string }) => a.name)).toContain('Nu Export Test')
  })

  test('6.4 export reflects agents deleted during the session', async ({ page }) => {
    // Delete Delta Security
    page.on('dialog', async (dialog) => dialog.accept())
    await cardByName(page, 'Delta Security').locator('button[title="Delete"]').click()
    await expect(page.locator('.card')).toHaveCount(4)

    // Export and verify
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button:has-text("↓ Export")'),
    ])
    const content = readFileSync(await download.path()!, 'utf-8')
    const agents = JSON.parse(content)

    expect(agents).toHaveLength(4)
    expect(agents.map((a: { name: string }) => a.name)).not.toContain('Delta Security')
  })
})
