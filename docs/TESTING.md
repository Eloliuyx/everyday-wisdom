# Verification and real-app test matrix

Recorded 2026-09-24 UTC. Version: 1.0.0 development preview; content 0.4.

## Automated verification

`npm run package` checks types, official Obsidian ESLint rules, Vitest, all 366 content dates, and the production bundle. **54 tests passed** on 2026-09-24 UTC. Tests exercise pure transforms, plugin event/write integration with mock Obsidian APIs, and marker decorations using real CodeMirror state. They do not test Obsidian's actual editor rendering or settings renderer.

Covered: leap and century years; annual mapping; date folders, custom formats, localized tokens, and invalid/incomplete dates; optional questions; BOM/CRLF/frontmatter; duplicate and edited blocks; code/quoted marker examples; malformed markers; preview/write races; cancellation; individual write failures; concurrent insertion; dirty editors; differing open editors; startup discovery; historical opening; creation for past dates; delayed template writes; disabling/unloading; automatic suspension during batches.

The latest direction removes individual insertion commands and menus. Tests cover switch-on timing, notes created while off, saved-off startup, preservation of already inserted reflections when disabled, and no reinsertion into existing notes after cleanup/restart. They also verify that no insertion command or editor/file context-menu handler is registered. Live Preview / Source mode tests cover paired-marker ranges, damaged/code-example markers, edited reflection bodies, position changes after typing, and adjacent blocks/BOM. The support-footer CSS matches Everyday Classical Music after class-prefix renaming.

Build graph verification: the production bundle imports only host-provided `obsidian`, `@codemirror/state`, and `@codemirror/view`. Bundled third-party code is the tree-shaken daily-notes helper and the adapted music-plugin support footer; notices are included. No `fetch`, XMLHttpRequest, WebSocket, or requestUrl call was found in the production bundle. A real offline-app test remains pending. Ko-fi opens only from an explicit button click.

## Test environment and blockers

- Development: macOS, Node 24.19.0, ESLint 10.11.0, TypeScript and dependencies pinned by package-lock.json. Clean dependency installation and production packaging passed in the user's project directory; npm reported zero known vulnerabilities.
- Installed Obsidian: 1.13.7. No successful assisted live-app session has been established. On the latest check, the official CLI found Obsidian running but reported that the command-line interface is disabled. Computer Use previously reported that permissions were not granted.
- Minimum declared Obsidian: 1.13.1, chosen for its settings API. This exact version has not been run.
- No actual iOS or Android Obsidian run was performed. A desktop narrow viewport would not count as either.

## Isolated test vault

Run `npm run package`, then `npm run test:vault`. The second command creates `test-vault/` and refuses to overwrite it. Open this folder using Obsidian's **Open folder as vault**. Enable the locally bundled plugin if prompted. No personal vault is modified or registered by the script.

For assisted testing, run Obsidian, enable its official command-line interface in General settings, and use the dedicated test vault. Computer Use permission is needed for direct UI verification/screenshots. Keep the table below pending until evidence is collected.

## Acceptance matrix

On 2026-09-24 UTC, the user reported that the main workflow was working in their test vault. Their macOS Deletion screenshot shows a completed operation with 1 updated, 0 skipped, 0 failed, and 0 not processed. The remaining reported UI issue was the left-aligned Done button; this has been changed to use the same right-aligned action row as the preview. Visual confirmation of that adjustment is pending.

This is a user-reported basic workflow check. The detailed rows below remain **pending individual actual-app verification**. Record platform, app version, date, result, and evidence when executing them.

| Scenario | Expected result |
| --- | --- |
| Create today's Daily Note with supplied template | Properties first, one reflection, then template/body unchanged. |
| Reopen today's existing note, including one with no reflection | No automatic changes. |
| Open existing historical note | No automatic changes. Backfill can add its own date's reflection when explicitly requested. |
| Create while off, turn switch on, then create another date | Only the note created after enabling receives a reflection. |
| Create an explicit past/future daily note | One reflection for that date. |
| Create Feb 29 in a leap year; open March 1 in common/leap years | Correct Feb 29; identical March 1 content across years. |
| Dates in configured subfolders/custom calendar formats | Recognized correctly; other folders and ambiguous formats untouched. |
| No-question date | No empty prompt or label. |
| Switch between Live Preview and Reading mode | Same callout; no visible markers; one title. |
| Live Preview / Source mode toggle, existing reflections, malformed markers | Intact marker lines hidden only in Live Preview, no stored-text changes; Source mode and malformed markers remain inspectable. |
| Individual manual insertion removed | No Insert reflection action in editor/file menus, command palette, plugin settings, or registered hotkey commands. |
| Donation footer | Standalone centered Feed the Markhor button matches music plugin; no request on settings open/search; click opens the correct Ko-fi URL. |
| Dark/light themes, narrow viewport, long title | Legible, wrapping content; no horizontal overflow. |
| All settings and modal actions using keyboard | Focus visible and every action reachable; Escape cancels safely. |
| Turn automatic off, create/reopen notes, restart app | No automatic writes; saved setting remains off. |
| Switch position to bottom | New insertion at end; existing blocks stay in place. |
| Edit text before auto insertion; open note twice | Personal/unsaved writing preserved; disagreeing views safely skipped. |
| Fill a range containing existing, empty, invalid, absent dates | Preview accurate; only existing recognized notes updated; no new files. |
| Change a note after preview | Note skipped without overwrite. |
| Cancel during a large batch; retry | Counts accurate; completed changes kept; retry is idempotent. |
| Remove: intact, edited, mixed, malformed, and sample markers | Only unedited valid blocks removed; personal writing intact. |
| Remove with automatic-off default | Setting persists off after restart. |
| Remove with automatic left on | Only future creations receive reflections. Reopening the cleaned note or restarting leaves it unchanged. |
| Disable/re-enable plugin; restart; replace plugin build | No writes after unload; existing blocks unchanged after upgrade. |
| Offline run | All core operations work without network. |
| Two-device sync or simultaneous changes | No lost user text; any sync conflicts documented; no blanket conflict-resolution promise. |
| Actual iOS and Android | Repeat switch on/off, creation, existing-note opening, fill, removal, cancellation, restart. |
| Minimum declared version 1.13.1 | Plugin loads and all required APIs/settings work. |

Arbitrary Templater scripts, Periodic Notes, and dual-device sync have not been integration-tested. Do not convert mock-test coverage into a platform support claim.
