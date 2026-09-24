# Everyday Wisdom

One thoughtful reflection for each date in your Daily Notes, entirely offline.

Everyday Wisdom adds a short English reflection to the top of a daily note, after its properties. The collection contains 366 original reflections, including February 29. Most end with an optional question; some simply offer something to notice. They are contemporary reflections, not attributed historical quotations.

**Status:** private development preview, not yet approved or listed in Obsidian Community plugins. See [release readiness](docs/RELEASE_READINESS.md) for tested and untested areas.

## How it works

- Create a daily note: its own date selects the reflection, even for a past or future date.
- Open today's note: a missing reflection is added automatically.
- Read an older note: nothing is added just from opening it.
- Right-click inside the text of a daily note and choose **Insert reflection** to add one manually. It appears directly in the editor menu, without opening the built-in Insert submenu. There is no manual-insert entry in the file explorer menu or this plugin's settings.
- Existing reflections stay as written. Running an insertion again does not duplicate them, including after you edit their visible text.

The date-to-reflection mapping repeats annually. March 1 always selects March 1, regardless of leap years. The 64 entries without questions do not display an empty question label.

## Install the development preview

Requires Obsidian **1.13.1 or later**. This minimum follows the settings API used by the plugin; platform testing is still pending.

1. Use an isolated test vault for this preview. Build the project below, or obtain its current installation ZIP from the project owner.
2. Extract the `everyday-wisdom` folder into `<vault>/.obsidian/plugins/`.
3. In Obsidian, enable Community plugins and enable **Everyday Wisdom**.
4. Enable the **Daily notes** core plugin and configure its folder, date format, and optional template.
5. Create a daily note as usual.

Use a complete calendar date format such as `YYYY-MM-DD`, `D MMMM YYYY`, or `YYYY/MM/DD` (date-based subfolders). The full path relative to the daily-note folder must match the format exactly. Yearless, month-only, week-date, and ordinal-day formats are currently unsupported. Notes outside that folder or with ambiguous dates are left alone.

If Periodic Notes has daily notes enabled, the daily-notes helper uses its daily settings in preference to the core plugin. This compatibility path is not yet tested in the actual app. Core Daily notes is the support baseline.

## Settings and batch operations

For a keyboard shortcut, open **Settings → Hotkeys**, search **Everyday Wisdom: Insert reflection**, and assign your preferred keys. The same command is available through **Cmd+P** (macOS) or **Ctrl+P** (Windows/Linux). No shortcut is assigned by default.

**Automatic insertion** can be turned off. **Insert position** can be changed to the end of the note; already inserted reflections are not moved.

**Backfill** accepts a date range or all existing daily notes. A preview shows which notes will change and which will be skipped. Confirm to apply it. It never creates files for missing dates.

**Deletion** removes reflections, never note files, and requires a preview and confirmation. Only intact, unchanged marked blocks are removed. Edited blocks, unclear markers, and personal writing are kept. A note with a mix of edited and unchanged blocks is kept in full. Automatic insertion is turned off by default when deletion is confirmed; you can opt out in the dialog.

You can stop a batch after the current note. Results report updates, skips, failures, and notes not processed. A note changed since preview is skipped. The preview is not a backup; use your usual vault backup and sync practices.

## Your notes and privacy

Inserted reflections are ordinary Markdown callouts with identifying comments. These are permanent metadata for duplicate detection and safe cleanup, not test-version messages. The plugin hides intact marker lines in **Live Preview**, including existing reflections. They are HTML comments and are not displayed in **Reading view**. **Source mode** intentionally shows the underlying Markdown, including markers. Broken markers remain visible for inspection. The display extension never changes the stored note.

Keep the comments if you want duplicate detection and safe cleanup. Editing inside a generated block causes cleanup to preserve it. Removing all its identifying comments makes it ordinary writing that the plugin cannot identify.

Your properties and existing body text are preserved. Removal may leave blank separator lines in place. Disabling or uninstalling the plugin leaves all written text in your notes. Updating the content collection does not rewrite existing reflections.

There are no accounts, telemetry, AI calls, remote content fetches, or background network requests. **Help and feedback** opens this repository only when clicked. **Feed the Markhor 🦌🪽**, centered below the settings, opens [the author's Ko-fi page](https://ko-fi.com/flyingmarkhor) only when clicked. Neither link sends note content. The content and required helper code are bundled. This plugin does not provide its own sync or resolve simultaneous edits from multiple devices.

## Known limitations

- Desktop and mobile app acceptance testing is not yet complete. `isDesktopOnly: false` expresses the intended mobile compatibility; it is not evidence of iOS or Android testing.
- The template handling waits for a brief quiet period and watches changes to newly created notes for ten seconds. Arbitrary asynchronous Templater scripts beyond that window are not guaranteed; the manual command remains available.
- Imported/synced files emitting a create event after vault startup may be treated as newly created daily notes. Turn automatic insertion off before an import if needed.
- Simultaneous windows with different unsaved content are left alone. Reconcile them before retrying a manual or bulk command.
- The plugin requires a recognizable daily-note date; it does not apply to arbitrary Markdown notes.

## Build and test

Use Node.js 24 and npm. macOS/Linux packaging also requires `zip`.

```sh
npm ci
npm run package
npm run test:vault
```

The package is `dist/everyday-wisdom-1.0.0.zip`. `dist/main.js`, `dist/manifest.json`, and `dist/styles.css` are the separate future release attachments. The test-vault command creates `test-vault/` with the plugin and sample notes; it refuses to overwrite an existing folder. Open that folder as a vault in Obsidian. It does not alter or register any personal vault.

`npm run check` runs the official Obsidian ESLint rules, tests, type checking, content checks, and a production build. The bundle imports only host-provided Obsidian and CodeMirror APIs at runtime, with no Node/Electron dependencies. Tests use mock Obsidian APIs and real CodeMirror state and do not replace real-app verification.

## Content, license, and support

Content edition: **0.4**, English, 366 dates. Read the [collection](docs/CONTENT.md) and [content QA report](docs/CONTENT_QA_REPORT.md).

The public license is pending owner selection; see [LICENSE](LICENSE) and the [proposal](docs/LICENSING_PROPOSAL.md). Third-party licensing is in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

Author: **the flying markhor**. Report a problem through [GitHub Issues](https://github.com/Eloliuyx/everyday-wisdom/issues), including the plugin/Obsidian versions, daily-note format, and a minimal example without private writing.
