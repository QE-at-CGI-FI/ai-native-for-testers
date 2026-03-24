# Agent Inventory — Playwright End-to-End Test Plan

**Seed file:** `tests/seed.ts`

---

## 0. Seed Data Specification

Every test scenario resets `localStorage['agent-inventory']` to a controlled dataset via
`page.addInitScript` before navigation, so tests are independent and order-agnostic.

**Canonical seed agents (5):**

```json
[
  { "id": "seed-001", "name": "Alpha Tester",  "icon": "🧪", "category": "Testing",        "status": "active",       "purpose": "Runs automated test suites on pull requests.",         "tools": "Read, Bash",  "trigger": "On every PR",              "tags": ["automation", "pr"],        "notes": "Requires CI access."       },
  { "id": "seed-002", "name": "Beta Explorer", "icon": "🔍", "category": "Exploration",     "status": "experimental", "purpose": "Explores unknown codebases and maps structure.",         "tools": "Glob, Grep",  "trigger": "When starting a new project", "tags": ["exploration", "mapping"],  "notes": "Read-only agent."          },
  { "id": "seed-003", "name": "Gamma Docs",    "icon": "📖", "category": "Documentation",   "status": "active",       "purpose": "Generates API documentation from source code.",         "tools": "Read, Write", "trigger": "After code changes",       "tags": ["docs", "api"],             "notes": "Review before publishing." },
  { "id": "seed-004", "name": "Delta Security","icon": "🔒", "category": "Security",        "status": "deprecated",   "purpose": "Scans code for OWASP vulnerabilities.",                 "tools": "Read, Grep",  "trigger": "Before merge",             "tags": ["security", "owasp"],       "notes": "Replaced by newer scanner."},
  { "id": "seed-005", "name": "Epsilon Infra", "icon": "⚙️", "category": "Infrastructure", "status": "active",       "purpose": "Configures deployment pipelines.",                      "tools": "Bash, Edit",  "trigger": "On release day",           "tags": ["infra", "deploy"],         "notes": "Production only."          }
]
```

**Expected stats from seed:** Total=5, Active=3, Experimental=1, Categories=5

---

## 1. Page Load and Initial State

**Seed:** `tests/seed.ts`

### 1.1 Header and branding render correctly
**Steps:**
1. Navigate to the application root URL.
2. Observe the header.

**Expected:** Header shows the robot emoji, heading "Agent Inventory", and subtitle "AI-Native for Testers".

---

### 1.2 Stats bar reflects seed data counts
**Steps:**
1. Navigate to root URL.
2. Read each stat value.

**Expected:** Total Agents=5, Active=3, Experimental=1, Categories=5.

---

### 1.3 Agent grid renders all five seed cards
**Steps:**
1. Navigate to root URL.
2. Count cards and verify each agent name is visible.

**Expected:** Exactly 5 cards. All five seed agent names are visible. Empty state is absent.

---

### 1.4 Filter chips render all categories plus "All"
**Steps:**
1. Navigate to root URL.
2. Read filter chip labels.

**Expected:** Chips: All, Testing, Exploration, Documentation, Security, Infrastructure. "All" has active class.

---

### 1.5 Modal is closed on initial load
**Steps:**
1. Navigate to root URL.
2. Check overlay visibility.

**Expected:** Overlay does not have `.open` class.

---

### 1.6 Agent cards show correct status badges
**Steps:**
1. Navigate to root URL.
2. Check badges on Alpha Tester, Beta Explorer, Delta Security cards.

**Expected:** Active / Experimental / Deprecated badges match seed statuses.

---

### 1.7 Agent card displays tags
**Steps:**
1. Navigate to root URL.
2. Check tags on Alpha Tester card.

**Expected:** Tags "automation" and "pr" are visible.

---

### 1.8 Agent card displays metadata fields
**Steps:**
1. Navigate to root URL.
2. Check Tools, Trigger, Notes on Alpha Tester card.

**Expected:** "Read, Bash", "On every PR", "Requires CI access." are visible.

---

## 2. Search and Filter

**Seed:** `tests/seed.ts`

### 2.1 Search by agent name narrows the grid
**Steps:**
1. Navigate to root URL.
2. Type "Alpha" in the search box.

**Expected:** Only "Alpha Tester" card is visible.

---

### 2.2 Search by purpose text narrows the grid
**Steps:**
1. Navigate to root URL.
2. Type "OWASP" in the search box.

**Expected:** Only "Delta Security" is visible.

---

### 2.3 Search by tag narrows the grid
**Steps:**
1. Navigate to root URL.
2. Type "mapping" in the search box.

**Expected:** Only "Beta Explorer" is visible.

---

### 2.4 Search is case-insensitive
**Steps:**
1. Navigate to root URL.
2. Type "alpha" (lowercase) in the search box.

**Expected:** "Alpha Tester" card is visible.

---

### 2.5 Search with no matches shows empty state
**Steps:**
1. Navigate to root URL.
2. Type "zzznomatch" in the search box.

**Expected:** No cards rendered. Empty state visible with "No agents match your search."

---

### 2.6 Clearing search restores full grid
**Steps:**
1. Type "zzznomatch" to trigger empty state.
2. Clear the search box.

**Expected:** All 5 cards are visible again.

---

### 2.7 Category filter chip shows only matching agents
**Steps:**
1. Navigate to root URL.
2. Click "Testing" filter chip.

**Expected:** Only "Alpha Tester" is visible. "Testing" chip has `active` class.

---

### 2.8 Category filter "All" restores full grid
**Steps:**
1. Click "Testing" to filter.
2. Click "All".

**Expected:** All 5 cards visible. "All" has `active` class.

---

### 2.9 Filter and search combined show intersection
**Steps:**
1. Click "Testing" filter.
2. Type "alpha" in search.

**Expected:** Only "Alpha Tester" visible.

---

### 2.10 Filter and search with no intersection shows empty state
**Steps:**
1. Click "Security" filter.
2. Type "alpha" in search.

**Expected:** Empty state visible.

---

## 3. Adding a New Agent

**Seed:** `tests/seed.ts`

### 3.1 Happy path — add agent with required fields only
**Steps:**
1. Navigate to root URL.
2. Click "+ Add Agent".
3. Verify modal title is "Add Agent".
4. Type "Zeta QA" in Name.
5. Type "Validates feature completeness." in Purpose.
6. Click "Save Agent".

**Expected:** Modal closes. "Zeta QA" card appears. Total=6, Active=4.

---

### 3.2 Happy path — add agent with all fields
**Steps:**
1. Click "+ Add Agent".
2. Fill all fields: Name="Eta Monitor", Icon="📡", Category=Infrastructure, Status=experimental, Purpose, Tools, Trigger, Tags="monitoring, production", Notes.
3. Click "Save Agent".

**Expected:** Card shows all provided data including two tags "monitoring" and "production".

---

### 3.3 Validation — Name required
**Steps:**
1. Open modal. Leave Name empty. Fill Purpose.
2. Click "Save Agent". Accept alert.

**Expected:** Alert fires with "Name and Purpose are required." Modal stays open. Count remains 5.

---

### 3.4 Validation — Purpose required
**Steps:**
1. Open modal. Fill Name. Leave Purpose empty.
2. Click "Save Agent". Accept alert.

**Expected:** Alert fires. Modal stays open. Count remains 5.

---

### 3.5 Icon defaults to 🤖 when blank
**Steps:**
1. Open modal. Fill Name and Purpose. Leave Icon blank.
2. Save. Check the new card.

**Expected:** New card shows "🤖" icon.

---

### 3.6 Cancel discards changes
**Steps:**
1. Open modal. Fill Name and Purpose.
2. Click "Cancel".

**Expected:** Modal closes. No new card added.

---

### 3.7 Overlay click discards changes
**Steps:**
1. Open modal. Fill Name and Purpose.
2. Click the overlay backdrop (outside modal).

**Expected:** Modal closes. No new card added.

---

### 3.8 Escape key closes modal without saving
**Steps:**
1. Open modal. Fill Name and Purpose.
2. Press Escape.

**Expected:** Modal closes. No new card added.

---

### 3.9 Keyboard shortcut "n" opens Add Agent modal
**Steps:**
1. Navigate to root URL.
2. Click on the page background (not an input).
3. Press "n".

**Expected:** Modal opens with title "Add Agent" and empty form.

---

### 3.10 New agent persists after page reload
**Steps:**
1. Add "Nu Persist" agent.
2. Reload the page.

**Expected:** "Nu Persist" card still present after reload.

---

## 4. Editing an Existing Agent

**Seed:** `tests/seed.ts`

### 4.1 Happy path — edit name and purpose
**Steps:**
1. Navigate to root URL.
2. Click edit on "Gamma Docs".
3. Verify modal title is "Edit Agent".
4. Change Name to "Gamma Docs v2".
5. Change Purpose to updated text.
6. Click "Save Agent".

**Expected:** Modal closes. "Gamma Docs v2" card appears. "Gamma Docs" is gone. Count=5.

---

### 4.2 Edit modal pre-populates all fields
**Steps:**
1. Click edit on "Alpha Tester".
2. Read all form fields.

**Expected:** Name="Alpha Tester", Icon="🧪", Category=Testing, Status=active, Tools="Read, Bash", Trigger="On every PR", Tags="automation, pr", Notes="Requires CI access."

---

### 4.3 Edit tags updates card display
**Steps:**
1. Edit "Alpha Tester".
2. Clear Tags. Type "ci-cd, testing, new-tag".
3. Save.

**Expected:** Card shows three tags: "ci-cd", "testing", "new-tag". Original tags absent.

---

### 4.4 Edit validation — clearing Name shows alert
**Steps:**
1. Edit "Beta Explorer". Clear Name. Click "Save Agent". Accept alert.

**Expected:** Alert fires. Modal stays open. Card unchanged.

---

### 4.5 Cancel edit discards changes
**Steps:**
1. Edit "Delta Security". Change Name to "Delta Security MODIFIED".
2. Click "Cancel".

**Expected:** Card still shows "Delta Security". Modified name absent.

---

### 4.6 Edited agent persists after reload
**Steps:**
1. Edit "Epsilon Infra". Change Name to "Epsilon Infra Updated". Save.
2. Reload page.

**Expected:** "Epsilon Infra Updated" card present. "Epsilon Infra" absent.

---

## 5. Deleting an Agent

**Seed:** `tests/seed.ts`

### 5.1 Confirming delete removes the card
**Steps:**
1. Click delete on "Delta Security".
2. Verify confirm dialog mentions `Delta Security`.
3. Confirm deletion.

**Expected:** Card removed. Total=4. "Security" filter chip removed.

---

### 5.2 Cancelling delete leaves card intact
**Steps:**
1. Click delete on "Delta Security".
2. Cancel the confirm dialog.

**Expected:** Card remains. Count stays 5.

---

### 5.3 Deletion persists after reload
**Steps:**
1. Delete "Beta Explorer". Confirm.
2. Reload page.

**Expected:** "Beta Explorer" absent. Count=4.

---

### 5.4 Deleting last agent in a category removes that filter chip
**Steps:**
1. Delete "Delta Security" (only Security agent).

**Expected:** "Security" filter chip is gone from filter bar.

---

## 6. Export Functionality

**Seed:** `tests/seed.ts`

### 6.1 Export triggers a JSON file download with correct filename
**Steps:**
1. Navigate to root URL. Set up download listener.
2. Click "↓ Export".

**Expected:** Download fires. Filename matches `agent-inventory-YYYY-MM-DD.json`.

---

### 6.2 Exported file contains valid JSON matching seed agents
**Steps:**
1. Navigate to root URL. Set up download listener.
2. Click "↓ Export". Read file content.

**Expected:** Valid JSON array of 5 objects. Agent names match the 5 seed agents.

---

### 6.3 Export reflects agents added during session
**Steps:**
1. Add "Nu Export Test" agent.
2. Export and read file.

**Expected:** Array has 6 items. "Nu Export Test" is present.

---

### 6.4 Export reflects agents deleted during session
**Steps:**
1. Delete "Delta Security". Export and read file.

**Expected:** Array has 4 items. "Delta Security" absent.

---

## Appendix: Selector Reference

| Element | Selector |
|---------|----------|
| Search box | `input.search-box` |
| Export button | `button:has-text("↓ Export")` |
| Add Agent button | `button:has-text("+ Add Agent")` |
| Filter chip by name | `.filter-chip:has-text("Testing")` |
| Agent card by name | `.card:has(.card-name:has-text("Alpha Tester"))` |
| Card edit button | card `.icon-btn[title="Edit"]` |
| Card delete button | card `.icon-btn[title="Delete"]` |
| Status badge | `.status-badge` within card |
| Tag chips | `.tag` within card |
| Empty state | `.empty-state` |
| Modal overlay | `.overlay` |
| Modal title | `.modal h2` |
| Modal Save button | `button:has-text("Save Agent")` |
| Modal Cancel button | `.modal-footer button:has-text("Cancel")` |
