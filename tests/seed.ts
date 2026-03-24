// spec: tests/plan.md
// Canonical seed data and helper used by all e2e test files.
import type { Page } from '@playwright/test'

export const SEED_AGENTS = [
  {
    id: 'seed-001',
    name: 'Alpha Tester',
    icon: '🧪',
    category: 'Testing',
    status: 'active',
    purpose: 'Runs automated test suites on pull requests.',
    tools: 'Read, Bash',
    trigger: 'On every PR',
    tags: ['automation', 'pr'],
    notes: 'Requires CI access.',
  },
  {
    id: 'seed-002',
    name: 'Beta Explorer',
    icon: '🔍',
    category: 'Exploration',
    status: 'experimental',
    purpose: 'Explores unknown codebases and maps structure.',
    tools: 'Glob, Grep',
    trigger: 'When starting a new project',
    tags: ['exploration', 'mapping'],
    notes: 'Read-only agent.',
  },
  {
    id: 'seed-003',
    name: 'Gamma Docs',
    icon: '📖',
    category: 'Documentation',
    status: 'active',
    purpose: 'Generates API documentation from source code.',
    tools: 'Read, Write',
    trigger: 'After code changes',
    tags: ['docs', 'api'],
    notes: 'Review before publishing.',
  },
  {
    id: 'seed-004',
    name: 'Delta Security',
    icon: '🔒',
    category: 'Security',
    status: 'deprecated',
    purpose: 'Scans code for OWASP vulnerabilities.',
    tools: 'Read, Grep',
    trigger: 'Before merge',
    tags: ['security', 'owasp'],
    notes: 'Replaced by newer scanner.',
  },
  {
    id: 'seed-005',
    name: 'Epsilon Infra',
    icon: '⚙️',
    category: 'Infrastructure',
    status: 'active',
    purpose: 'Configures deployment pipelines.',
    tools: 'Bash, Edit',
    trigger: 'On release day',
    tags: ['infra', 'deploy'],
    notes: 'Production only.',
  },
]

/** Inject seed agents into localStorage before the page loads.
 *  Uses a session-scoped flag so that on subsequent navigations (e.g. reload)
 *  the init script does NOT overwrite data that the app has already persisted.
 */
export async function seedAgents(page: Page, agents = SEED_AGENTS): Promise<void> {
  const data = JSON.stringify(agents)
  await page.addInitScript((d) => {
    if (!sessionStorage.getItem('__seeded__')) {
      localStorage.setItem('agent-inventory', d)
      sessionStorage.setItem('__seeded__', '1')
    }
  }, data)
}

/** Locate a card by agent name. */
export function cardByName(page: Page, name: string) {
  return page.locator(`.card:has(.card-name:has-text("${name}"))`)
}
