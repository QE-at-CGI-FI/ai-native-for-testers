// spec: tests/plan.md § 3. Adding a New Agent
// seed: tests/seed.ts
import { test, expect } from '@playwright/test'
import { seedAgents, cardByName } from './seed'

test.describe('Adding a New Agent', () => {
  test.beforeEach(async ({ page }) => {
    await seedAgents(page)
    await page.goto('/')
  })

  test('3.1 happy path — add agent with required fields only', async ({ page }) => {
    // Click "+ Add Agent" and verify modal opens
    await page.click('button:has-text("+ Add Agent")')
    await expect(page.locator('.modal h2')).toHaveText('Add Agent')
    await expect(page.locator('input[placeholder*="Test Generator"]')).toBeEmpty()

    // Fill required fields
    await page.fill('input[placeholder*="Test Generator"]', 'Zeta QA')
    await page.fill('textarea[placeholder*="What does this agent do"]', 'Validates feature completeness.')

    // Save
    await page.click('button:has-text("Save Agent")')

    // Modal closes and card appears
    await expect(page.locator('.overlay')).not.toHaveClass(/open/)
    await expect(cardByName(page, 'Zeta QA')).toBeVisible()
    await expect(page.locator('.stat', { hasText: 'Total Agents' }).locator('.stat-value')).toHaveText('6')
  })

  test('3.2 happy path — add agent with all fields populated', async ({ page }) => {
    // Open modal and fill all fields
    await page.click('button:has-text("+ Add Agent")')
    await page.fill('input[placeholder*="Test Generator"]', 'Eta Monitor')
    await page.fill('input[placeholder="🤖"]', '📡')
    await page.selectOption('select:near(:text("Category"))', 'Infrastructure')
    await page.selectOption('select:near(:text("Status"))', 'experimental')
    await page.fill('textarea[placeholder*="What does this agent do"]', 'Monitors system health metrics.')
    await page.fill('input[placeholder*="Read, Grep, Bash"]', 'Bash, Read')
    await page.fill('input[placeholder*="When you need"]', 'After every deploy')
    await page.fill('input[placeholder*="testing, automation"]', 'monitoring, production')
    await page.fill('textarea[placeholder*="extra context"]', 'Alert thresholds configurable.')
    await page.click('button:has-text("Save Agent")')

    // Verify card shows all data
    const card = cardByName(page, 'Eta Monitor')
    await expect(card.locator('.status-badge')).toContainText('Experimental')
    await expect(card).toContainText('Bash, Read')
    await expect(card.locator('.tag', { hasText: 'monitoring' })).toBeVisible()
    await expect(card.locator('.tag', { hasText: 'production' })).toBeVisible()
  })

  test('3.3 validation — Name is required', async ({ page }) => {
    // Leave Name empty, fill Purpose
    await page.click('button:has-text("+ Add Agent")')
    await page.fill('textarea[placeholder*="What does this agent do"]', 'Some valid purpose.')

    // Expect alert on save
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toBe('Name and Purpose are required.')
      await dialog.accept()
    })
    await page.click('button:has-text("Save Agent")')

    // Modal stays open, count unchanged
    await expect(page.locator('.overlay')).toHaveClass(/open/)
    await expect(page.locator('.card')).toHaveCount(5)
  })

  test('3.4 validation — Purpose is required', async ({ page }) => {
    // Fill Name, leave Purpose empty
    await page.click('button:has-text("+ Add Agent")')
    await page.fill('input[placeholder*="Test Generator"]', 'Theta Agent')

    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toBe('Name and Purpose are required.')
      await dialog.accept()
    })
    await page.click('button:has-text("Save Agent")')

    await expect(page.locator('.overlay')).toHaveClass(/open/)
    await expect(page.locator('.card')).toHaveCount(5)
  })

  test('3.5 icon defaults to 🤖 when left blank', async ({ page }) => {
    // Fill Name and Purpose, leave Icon blank
    await page.click('button:has-text("+ Add Agent")')
    await page.fill('input[placeholder*="Test Generator"]', 'Iota Agent')
    await page.fill('textarea[placeholder*="What does this agent do"]', 'Does a thing.')
    await page.click('button:has-text("Save Agent")')

    // Card icon shows robot emoji
    await expect(cardByName(page, 'Iota Agent').locator('.card-icon')).toContainText('🤖')
  })

  test('3.6 Cancel button closes modal without saving', async ({ page }) => {
    // Open modal, fill fields, then cancel
    await page.click('button:has-text("+ Add Agent")')
    await page.fill('input[placeholder*="Test Generator"]', 'Kappa Ghost')
    await page.fill('textarea[placeholder*="What does this agent do"]', 'Should not be saved.')
    await page.click('.modal-footer button:has-text("Cancel")')

    // Modal closes, no new card
    await expect(page.locator('.overlay')).not.toHaveClass(/open/)
    await expect(page.locator('.card')).toHaveCount(5)
    await expect(page.locator('.card-name', { hasText: 'Kappa Ghost' })).not.toBeAttached()
  })

  test('3.7 clicking overlay backdrop closes modal without saving', async ({ page }) => {
    // Open modal, fill fields, click backdrop
    await page.click('button:has-text("+ Add Agent")')
    await page.fill('input[placeholder*="Test Generator"]', 'Lambda Ghost')
    await page.fill('textarea[placeholder*="What does this agent do"]', 'Should not be saved.')
    await page.locator('.overlay').click({ position: { x: 10, y: 10 } })

    await expect(page.locator('.overlay')).not.toHaveClass(/open/)
    await expect(page.locator('.card')).toHaveCount(5)
  })

  test('3.8 Escape key closes modal without saving', async ({ page }) => {
    // Open modal, fill fields, press Escape
    await page.click('button:has-text("+ Add Agent")')
    await page.fill('input[placeholder*="Test Generator"]', 'Mu Ghost')
    await page.fill('textarea[placeholder*="What does this agent do"]', 'Should not be saved.')
    await page.keyboard.press('Escape')

    await expect(page.locator('.overlay')).not.toHaveClass(/open/)
    await expect(page.locator('.card')).toHaveCount(5)
  })

  test('3.9 keyboard shortcut "n" opens Add Agent modal', async ({ page }) => {
    // Click on page background, then press "n"
    await page.locator('main').click()
    await page.keyboard.press('n')
    await expect(page.locator('.overlay')).toHaveClass(/open/)
    await expect(page.locator('.modal h2')).toHaveText('Add Agent')
  })

  test('3.10 new agent persists after page reload', async ({ page }) => {
    // Add an agent, then reload
    await page.click('button:has-text("+ Add Agent")')
    await page.fill('input[placeholder*="Test Generator"]', 'Nu Persist')
    await page.fill('textarea[placeholder*="What does this agent do"]', 'Tests persistence.')
    await page.click('button:has-text("Save Agent")')
    await expect(cardByName(page, 'Nu Persist')).toBeVisible()

    // Reload and verify persistence
    await page.reload()
    await expect(cardByName(page, 'Nu Persist')).toBeVisible()
    await expect(page.locator('.stat', { hasText: 'Total Agents' }).locator('.stat-value')).toHaveText('6')
  })
})
