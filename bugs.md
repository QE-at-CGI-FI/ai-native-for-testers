# Bug Report — Agent Inventory

NOTE: 
- unit-test and e2e pipelines are failing. 
- we did not yet implement playwright test with performance baseline measurement monitoring. 


Found by static code analysis and source review.
Files reviewed: `src/App.vue`, `src/components/AgentCard.vue`, `src/components/AgentModal.vue`, `src/data/defaultAgents.js`, `src/style.css`

---

## Critical

### BUG-01 Active filter becomes stuck when its category disappears
**File:** `src/App.vue:29,34`
**Steps:** Filter by "Security" → delete the last Security agent.
**Result:** The chip disappears but `activeFilter` stays `'Security'`. All agents are hidden. The UI shows "No agents match your search." even though all agents exist. The only escape is typing in the search box.
**Expected:** `activeFilter` resets to `'All'` when its category no longer exists.

---

### BUG-02 Export download fails in Firefox and some Chromium versions
**File:** `src/App.vue:83–87`
**Steps:** Click "↓ Export".
**Result:** The `<a>` element is never appended to the document before `.click()` is called. Firefox requires the element to be in the DOM for a programmatic download to trigger. Additionally, `URL.revokeObjectURL(url)` is called synchronously after `.click()` — before the browser has started the download — which causes "Failed - No File" errors.
**Expected:** The file downloads reliably in all browsers.

---

### BUG-03 Import confirm dialog has reversed semantics — pressing Cancel replaces all data
**File:** `src/App.vue:105–116`
**Steps:** Import a JSON file → read the confirm dialog "Merge (OK) or Replace all (Cancel)?" → press the browser's native Cancel button.
**Result:** `confirm()` returns `false`, so `merged = false`, and the code executes Replace all — wiping the entire agent list. Users expecting Cancel to abort the import lose all their data.
**Expected:** Cancel aborts the import and leaves the agent list unchanged.

---

### BUG-04 `persist()` has no error handling — saves silently fail when storage is full
**File:** `src/App.vue:24–26`
**Steps:** Fill localStorage close to the ~5 MB limit, then add or edit an agent.
**Result:** `localStorage.setItem` throws `QuotaExceededError`, which is unhandled. The save silently fails; the user sees no error and believes the data was saved.
**Expected:** The error is caught and the user is notified that the save failed.

---

### BUG-05 Pressing "n" while modal is open resets an in-progress edit without warning
**File:** `src/App.vue:131–135`
**Steps:** Open the Edit Agent modal for any agent → move focus to the overlay div or the Cancel button → press "n".
**Result:** `openModal()` is called with `id=null`, resetting the form to "Add Agent" mode, discarding all in-progress edits silently.
**Expected:** The shortcut is ignored when the modal is already open.

---

## Functional Bugs

### BUG-06 Search does not cover `tools`, `trigger`, or `notes` fields
**File:** `src/App.vue:35`
**Steps:** Type "Bash" or "On every PR" in the search box.
**Result:** No cards match, even though "Bash" and "On every PR" are displayed on cards.
**Expected:** Search covers all visible text fields: name, purpose, category, tags, tools, trigger, and notes.

---

### BUG-07 Importing agents with a non-standard category silently breaks the edit modal
**File:** `src/AgentModal.vue:82–90`
**Steps:** Import an agent with `"category": "MyCustom"` → click Edit on that agent.
**Result:** The `<select>` has no matching option; Vue shows no selection. Saving without noticing resets the category to the first option ("Testing").
**Expected:** Custom categories are either preserved in the select or the user is warned.

---

### BUG-08 Import does not validate field types — malformed data crashes the card renderer
**File:** `src/App.vue:102`
**Steps:** Import a JSON file containing `{ "name": "X", "purpose": "Y", "tags": "not-an-array" }`.
**Result:** The agent passes the `name && purpose` validation check and is stored. The card renderer then tries to iterate `agent.tags` and throws a TypeError.
**Expected:** Import validates that `tags` is an array, `status` is one of the known values, etc., or sanitises the data before storing.

---

### BUG-09 Duplicate tags cause Vue `v-for` key collision
**File:** `src/components/AgentCard.vue:62`
**Steps:** Add or edit an agent with tags "foo, foo".
**Result:** Vue warns about duplicate keys and rendering behaviour is undefined.
**Expected:** Tags are deduplicated before saving, or a unique key (index) is used in the `v-for`.

---

### BUG-10 "n" shortcut fires on Shift+N and Alt+N
**File:** `src/App.vue:131–132`
**Steps:** Press Shift+N or Alt+N anywhere on the page.
**Result:** The Add Agent modal opens, which is unlikely to be intentional.
**Expected:** Only plain `n` (no modifiers) triggers the shortcut.

---

### BUG-11 "n" shortcut fires when a `<SELECT>` element has focus
**File:** `src/App.vue:133–134`
**Steps:** Tab to the Category dropdown in the modal → press "n".
**Result:** The shortcut check excludes `INPUT` and `TEXTAREA` but not `SELECT`. The modal is reset to "Add Agent" mode.
**Expected:** The shortcut is suppressed whenever any form control has focus.

---

### BUG-12 Import merge uses agent name as the unique key — collides on duplicate names
**File:** `src/App.vue:110`
**Steps:** Import an agent whose name matches an existing agent but has a different `id` and purpose.
**Result:** The existing agent is silently overwritten based on name match alone, ignoring `id`.
**Expected:** Merge uses `id` as the primary key, falling back to name only when `id` is absent.

---

### BUG-13 `loadAgents()` silently swallows all errors — corrupted data causes silent data loss
**File:** `src/App.vue:16–22`
**Steps:** Manually corrupt the `agent-inventory` key in localStorage (e.g. write `"broken{json"`), then reload.
**Result:** The `catch(e) {}` discards the error with no log or user notification. The app loads defaults as if nothing happened; all saved agents are gone.
**Expected:** The error is logged and the user is notified that saved data could not be loaded.

---

### BUG-14 Default agent IDs are regenerated on every fresh session
**File:** `src/data/defaultAgents.js:23–101`
**Steps:** Clear localStorage → reload the page twice.
**Result:** `uid()` is called at module evaluation time. Each fresh session assigns new random IDs to default agents, so there is no stable identity for them across sessions.
**Expected:** Default agents have fixed, hardcoded IDs.

---

### BUG-15 `filteredAgents` crashes if `name` or `purpose` is `undefined`
**File:** `src/App.vue:35`
**Steps:** Import an agent with a missing `name` or `purpose` field, then type anything in the search box.
**Result:** `v.toLowerCase()` throws `TypeError: Cannot read properties of undefined` for the `undefined` field values.
**Expected:** Falsy field values are coerced to empty string before the search comparison.

---

### BUG-16 `colorFor` crashes if agent `name` is `undefined`
**File:** `src/components/AgentCard.vue:23`
**Steps:** Store or import an agent where `name` is `undefined`.
**Result:** `colorFor(undefined)` attempts `undefined.length` and throws a TypeError, crashing the card render.
**Expected:** `colorFor` guards against non-string input, or the card component defaults the name before passing it.

---

### BUG-17 `activeFilter` is not reset after a Replace-all import
**File:** `src/App.vue:114–116`
**Steps:** Set the active filter to "Security" → import a JSON file with no Security agents and choose Replace all.
**Result:** `activeFilter` remains `'Security'`, all imported agents are hidden, and the empty state is shown.
**Expected:** `activeFilter` resets to `'All'` after any import that may have changed the available categories.

---

## UX Issues

### BUG-18 Edit and Delete buttons are invisible and unreachable on touch devices
**File:** `src/style.css:228–234`
**Steps:** Open the app on a phone or tablet.
**Result:** `.card-actions { opacity: 0 }` is only revealed on `:hover`. Touch screens cannot hover, so edit and delete are permanently inaccessible without a mouse.
**Expected:** Buttons are always visible, or a long-press / tap-to-reveal interaction is provided.

---

### BUG-19 Empty state message is wrong when no agents exist at all
**File:** `src/App.vue:205–208`
**Steps:** Delete all agents.
**Result:** The empty state shows 🔎 and "No agents match your search." even though there is no active search and no agents at all.
**Expected:** The message adapts to context: "No agents yet. Click + Add Agent to create one." when the list is truly empty.

---

### BUG-20 `alert()` and `confirm()` used for all dialogs
**File:** `src/App.vue:74,105,119,121` / `src/components/AgentModal.vue:50`
**Result:** Native browser dialogs are visually inconsistent with the dark-themed UI, block the JavaScript thread, cannot be styled, and behave differently on mobile (iOS suppresses repeated alerts).
**Expected:** In-app dialog components or inline validation messages.

---

### BUG-21 Stats bar does not show deprecated agent count
**File:** `src/App.vue:40–45`
**Result:** Active and Experimental are counted, but Deprecated is not. There is no quick way to see how many deprecated agents exist.
**Expected:** A fourth stat shows the Deprecated count, or the stats reflect all three non-total statuses.

---

### BUG-22 Stats reflect the full agent list, not the filtered view
**File:** `src/App.vue:40–45`
**Steps:** Filter to "Testing" — 3 cards shown. Check the "Total Agents" stat.
**Result:** Total still reads the full count, inconsistently representing what is visible.
**Expected:** Stats update to reflect the currently filtered set, or a clear label distinguishes "showing X of Y" from the totals.

---

### BUG-23 No undo for delete
**File:** `src/App.vue:72–77`
**Result:** Deletion is immediate and permanent. One accidental confirmation destroys data with no recovery path.
**Expected:** A brief undo toast or a recycle bin / soft-delete pattern.

---

### BUG-24 Modal has no visible close (×) button
**File:** `src/components/AgentModal.vue:67–133`
**Result:** The only ways to close the modal are Cancel, Escape, or clicking the backdrop. Users unfamiliar with those interactions are stuck.
**Expected:** A visible × button in the top-right corner of the modal.

---

### BUG-25 No tooltip for truncated agent names
**File:** `src/style.css:213–219`
**Result:** Long names are cut off with ellipsis but there is no `title` attribute to reveal the full name on hover.
**Expected:** `.card-name` has `title="{{ agent.name }}"` so the full name is accessible on hover.

---

### BUG-26 No sort order or pagination
**Result:** Agents display in insertion order only. With many agents there is no way to sort by name, status, or date, and no pagination or virtual scrolling.

---

## Accessibility

### BUG-27 Form labels are not associated with their inputs
**File:** `src/components/AgentModal.vue:71–125`
**Result:** Every `<label>` is missing a `for` attribute. Clicking a label does not focus its input, and screen readers cannot associate label text with the field.
**Expected:** Each label has `for="field-id"` and its input has the matching `id`.

---

### BUG-28 Modal does not manage focus on open or close
**File:** `src/components/AgentModal.vue`
**Result:** When the modal opens, focus stays on the triggering button. When it closes, focus is not returned. Keyboard and screen reader users receive no indication that the modal appeared.
**Expected:** Focus moves to the first field (or the modal heading) on open, and returns to the triggering element on close.

---

### BUG-29 Modal does not trap focus
**File:** `src/components/AgentModal.vue`
**Result:** Tab navigation escapes the modal and reaches cards and header buttons behind the overlay while the modal is open.
**Expected:** Focus cycles only through modal elements while it is open.

---

### BUG-30 Modal is missing `role="dialog"` and `aria-modal="true"`
**File:** `src/components/AgentModal.vue:66`
**Result:** Screen readers do not identify the element as a modal dialog and do not restrict their virtual cursor to it.
**Expected:** `<div class="overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">`.

---

### BUG-31 Icon buttons have no `aria-label`
**File:** `src/components/AgentCard.vue:35–36`
**Result:** Edit (✏️) and Delete (🗑️) buttons rely on `title` attributes, which are not consistently announced by screen readers and are never surfaced on touch devices.
**Expected:** `<button aria-label="Edit Alpha Tester">` and `<button aria-label="Delete Alpha Tester">`.

---

### BUG-32 Gradient stat values are invisible in forced-colors / high-contrast mode
**File:** `src/style.css:138–141`
**Result:** `-webkit-text-fill-color: transparent` makes the numbers invisible when Windows High Contrast Mode or `forced-colors: active` is in effect, because the background gradient is stripped.
**Expected:** A fallback `color` is provided, or the gradient technique is replaced with a standard foreground colour.

---

### BUG-33 `outline: none` on all inputs removes visible focus rings
**File:** `src/style.css:79,356–360`
**Result:** Keyboard users lose the visible focus indicator on all inputs and textareas. The focus border-color change is subtle and browser-dependent.
**Expected:** A visible `:focus-visible` outline is provided that meets WCAG 2.4.7.

---

## Code Quality / Edge Cases

### BUG-34 `icon` field `maxlength="4"` is unreliable for multi-codepoint emoji
**File:** `src/components/AgentModal.vue:77`
**Result:** `maxlength` counts UTF-16 code units, not visible characters. A single complex emoji like 🏳️‍🌈 (14 code units) cannot be entered at all; two-codepoint emoji like 👨‍💻 (5 code units) are also rejected.
**Expected:** Remove the maxlength limit or enforce it on grapheme clusters.

---

### BUG-35 `FileReader.onerror` is never handled
**File:** `src/App.vue:97–126`
**Result:** If the file read fails (disk error, file removed between selection and reading), the error is silently ignored and the user receives no feedback.
**Expected:** A `reader.onerror` handler notifies the user that the file could not be read.

---

### BUG-36 No file size validation on import
**File:** `src/App.vue:94–126`
**Result:** A very large JSON file (e.g. 10 MB) is read into memory, parsed, and then `persist()` attempts to write it to localStorage. localStorage has a ~5 MB limit. Combined with BUG-04 (no error handling in `persist()`), this silently loses data.
**Expected:** Reject files over a reasonable size limit (e.g. 1 MB) before reading.

---

### BUG-37 `colorFor` has biased colour distribution
**File:** `src/data/defaultAgents.js:16–18`
**Result:** `h & 0xffff` gives values 0–65535. `65536 % 7 = 2`, so two colours in the pool appear once more often than the other five, creating a minor bias.
**Expected:** Use a distribution method that avoids modulo bias, or accept the bias as negligible.

---

### BUG-38 `uid()` has theoretical collision risk under rapid bulk operations
**File:** `src/data/defaultAgents.js:1–3`
**Result:** Only 8 random base-36 characters (~2.8 trillion combinations) combined with a millisecond timestamp. Rapid successive calls within the same millisecond (e.g. importing 1000 agents at once) could produce duplicate IDs.
**Expected:** Use `crypto.randomUUID()` for collision-proof IDs.

---

*Total issues found: 38 (5 critical, 12 functional, 9 UX, 7 accessibility, 5 code quality)*
