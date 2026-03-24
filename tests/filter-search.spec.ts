// spec: tests/plan.md § 2. Search and Filter
// seed: tests/seed.ts
import { test, expect } from '@playwright/test'
import { seedAgents, cardByName } from './seed'

test.describe('Search and Filter', () => {
  test.beforeEach(async ({ page }) => {
    await seedAgents(page)
    await page.goto('/')
  })

  test('2.1 search by agent name narrows the grid', async ({ page }) => {
    // Type "Alpha" in the search box
    await page.fill('input.search-box', 'Alpha')
    await expect(page.locator('.card')).toHaveCount(1)
    await expect(cardByName(page, 'Alpha Tester')).toBeVisible()
  })

  test('2.2 search by purpose text narrows the grid', async ({ page }) => {
    // Type "OWASP" — matches Delta Security's purpose
    await page.fill('input.search-box', 'OWASP')
    await expect(page.locator('.card')).toHaveCount(1)
    await expect(cardByName(page, 'Delta Security')).toBeVisible()
  })

  test('2.3 search by tag narrows the grid', async ({ page }) => {
    // Type "mapping" — tag on Beta Explorer
    await page.fill('input.search-box', 'mapping')
    await expect(page.locator('.card')).toHaveCount(1)
    await expect(cardByName(page, 'Beta Explorer')).toBeVisible()
  })

  test('2.4 search by category text narrows the grid', async ({ page }) => {
    // Type "Infrastructure" — category of Epsilon Infra
    await page.fill('input.search-box', 'Infrastructure')
    await expect(page.locator('.card')).toHaveCount(1)
    await expect(cardByName(page, 'Epsilon Infra')).toBeVisible()
  })

  test('2.5 search is case-insensitive', async ({ page }) => {
    // Type "alpha" (lowercase)
    await page.fill('input.search-box', 'alpha')
    await expect(cardByName(page, 'Alpha Tester')).toBeVisible()
  })

  test('2.6 search with no matches shows empty state', async ({ page }) => {
    // Type "zzznomatch"
    await page.fill('input.search-box', 'zzznomatch')
    await expect(page.locator('.card')).toHaveCount(0)
    await expect(page.locator('.empty-state')).toBeVisible()
    await expect(page.locator('.empty-state')).toContainText('No agents match your search.')
  })

  test('2.7 clearing search restores full grid', async ({ page }) => {
    // Type "zzznomatch" then clear
    await page.fill('input.search-box', 'zzznomatch')
    await expect(page.locator('.empty-state')).toBeVisible()
    await page.fill('input.search-box', '')
    await expect(page.locator('.card')).toHaveCount(5)
    await expect(page.locator('.empty-state')).not.toBeVisible()
  })

  test('2.8 category filter chip shows only matching agents', async ({ page }) => {
    // Click "Testing" filter chip
    await page.locator('.filter-chip', { hasText: 'Testing' }).click()
    await expect(page.locator('.card')).toHaveCount(1)
    await expect(cardByName(page, 'Alpha Tester')).toBeVisible()
    await expect(page.locator('.filter-chip', { hasText: 'Testing' })).toHaveClass(/active/)
  })

  test('2.9 "All" filter restores full grid', async ({ page }) => {
    // Click Testing then click All
    await page.locator('.filter-chip', { hasText: 'Testing' }).click()
    await expect(page.locator('.card')).toHaveCount(1)
    await page.locator('.filter-chip', { hasText: 'All' }).click()
    await expect(page.locator('.card')).toHaveCount(5)
    await expect(page.locator('.filter-chip', { hasText: 'All' })).toHaveClass(/active/)
  })

  test('2.10 filter and search combined show intersection', async ({ page }) => {
    // Click Testing, then type "alpha"
    await page.locator('.filter-chip', { hasText: 'Testing' }).click()
    await page.fill('input.search-box', 'alpha')
    await expect(page.locator('.card')).toHaveCount(1)
    await expect(cardByName(page, 'Alpha Tester')).toBeVisible()
  })

  test('2.11 filter and search with no intersection shows empty state', async ({ page }) => {
    // Click Security, then type "alpha"
    await page.locator('.filter-chip', { hasText: 'Security' }).click()
    await page.fill('input.search-box', 'alpha')
    await expect(page.locator('.card')).toHaveCount(0)
    await expect(page.locator('.empty-state')).toBeVisible()
  })
})
