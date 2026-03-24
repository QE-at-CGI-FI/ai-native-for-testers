// spec: tests/plan.md § 4. Editing an Existing Agent
// seed: tests/seed.ts
import { test, expect } from '@playwright/test'
import { seedAgents, cardByName } from './seed'

test.describe('Editing an Existing Agent', () => {
  test.beforeEach(async ({ page }) => {
    await seedAgents(page)
    await page.goto('/')
  })

  test('4.1 happy path — edit name and purpose', async ({ page }) => {
    // Click edit on "Gamma Docs"
    await cardByName(page, 'Gamma Docs').locator('button[title="Edit"]').click()

    // Verify modal opens as Edit Agent
    await expect(page.locator('.modal h2')).toHaveText('Edit Agent')

    // Change name and purpose
    const nameInput = page.locator('input[placeholder*="Test Generator"]')
    await nameInput.clear()
    await nameInput.fill('Gamma Docs v2')
    const purposeInput = page.locator('textarea[placeholder*="What does this agent do"]')
    await purposeInput.clear()
    await purposeInput.fill('Generates comprehensive API and user documentation.')

    await page.click('button:has-text("Save Agent")')

    // Modal closes, updated card appears, old card gone
    await expect(page.locator('.overlay')).not.toHaveClass(/open/)
    await expect(cardByName(page, 'Gamma Docs v2')).toBeVisible()
    await expect(page.locator('.card-name', { hasText: 'Gamma Docs' }).filter({ hasNotText: 'v2' })).not.toBeAttached()
    await expect(page.locator('.card')).toHaveCount(5)
  })

  test('4.2 edit modal pre-populates all fields from the existing agent', async ({ page }) => {
    // Click edit on "Alpha Tester"
    await cardByName(page, 'Alpha Tester').locator('button[title="Edit"]').click()

    // Read all form fields
    await expect(page.locator('input[placeholder*="Test Generator"]')).toHaveValue('Alpha Tester')
    await expect(page.locator('input[placeholder="🤖"]')).toHaveValue('🧪')
    await expect(page.locator('textarea[placeholder*="What does this agent do"]')).toHaveValue('Runs automated test suites on pull requests.')
    await expect(page.locator('input[placeholder*="Read, Grep, Bash"]')).toHaveValue('Read, Bash')
    await expect(page.locator('input[placeholder*="When you need"]')).toHaveValue('On every PR')
    await expect(page.locator('input[placeholder*="testing, automation"]')).toHaveValue('automation, pr')
    await expect(page.locator('textarea[placeholder*="extra context"]')).toHaveValue('Requires CI access.')
  })

  test('4.3 editing tags updates card display', async ({ page }) => {
    // Edit "Alpha Tester" tags
    await cardByName(page, 'Alpha Tester').locator('button[title="Edit"]').click()
    const tagsInput = page.locator('input[placeholder*="testing, automation"]')
    await tagsInput.clear()
    await tagsInput.fill('ci-cd, testing, new-tag')
    await page.click('button:has-text("Save Agent")')

    // Verify updated tags on card
    const card = cardByName(page, 'Alpha Tester')
    await expect(card.locator('.tag', { hasText: 'ci-cd' })).toBeVisible()
    await expect(card.locator('.tag', { hasText: 'testing' })).toBeVisible()
    await expect(card.locator('.tag', { hasText: 'new-tag' })).toBeVisible()
    await expect(card.locator('.tag', { hasText: 'automation' })).not.toBeAttached()
  })

  test('4.4 edit validation — clearing Name shows alert', async ({ page }) => {
    // Edit "Beta Explorer", clear Name, try to save
    await cardByName(page, 'Beta Explorer').locator('button[title="Edit"]').click()
    const nameInput = page.locator('input[placeholder*="Test Generator"]')
    await nameInput.clear()

    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toBe('Name and Purpose are required.')
      await dialog.accept()
    })
    await page.click('button:has-text("Save Agent")')

    // Modal stays open, card unchanged
    await expect(page.locator('.overlay')).toHaveClass(/open/)
    await expect(cardByName(page, 'Beta Explorer')).toBeVisible()
  })

  test('4.5 Cancel edit discards changes', async ({ page }) => {
    // Edit "Delta Security", change name, then cancel
    await cardByName(page, 'Delta Security').locator('button[title="Edit"]').click()
    const nameInput = page.locator('input[placeholder*="Test Generator"]')
    await nameInput.clear()
    await nameInput.fill('Delta Security MODIFIED')
    await page.click('.modal-footer button:has-text("Cancel")')

    // Original card unchanged
    await expect(cardByName(page, 'Delta Security')).toBeVisible()
    await expect(page.locator('.card-name', { hasText: 'Delta Security MODIFIED' })).not.toBeAttached()
  })

  test('4.6 edited agent persists after reload', async ({ page }) => {
    // Edit "Epsilon Infra" name
    await cardByName(page, 'Epsilon Infra').locator('button[title="Edit"]').click()
    const nameInput = page.locator('input[placeholder*="Test Generator"]')
    await nameInput.clear()
    await nameInput.fill('Epsilon Infra Updated')
    await page.click('button:has-text("Save Agent")')

    // Reload and verify
    await page.reload()
    await expect(cardByName(page, 'Epsilon Infra Updated')).toBeVisible()
    await expect(page.locator('.card-name', { hasText: 'Epsilon Infra' }).filter({ hasNotText: 'Updated' })).not.toBeAttached()
  })
})
