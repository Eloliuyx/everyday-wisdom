# Everyday Wisdom — release readiness

Updated 2026-09-24 UTC. **Installable development preview; not ready to submit or claim approved.**

Repository: https://github.com/Eloliuyx/everyday-wisdom (private during development).

Local folder: `~/Documents/obsidian-code/everyday-wisdom`.

Plugin version `1.0.0`; content edition `0.4`; author `the flying markhor` (carried over from the owner's existing plugin identity, to be confirmed before publication).

## Implemented

- 366 bundled English reflections, stable MM-DD selection and leap-day handling.
- Automatic creation/today-open insertion and a manual insert command.
- Settings for automatic insertion and top/bottom position.
- Hidden markers, edit checksums, frontmatter preservation, idempotence, and safe cleanup.
- Date-range/all-existing backfill and removal with preview, explicit confirmation, cancellation, and outcome counts.
- Latest-content writes, serialized per-note updates, editor-aware mutation, and preview-change detection.
- Local-only runtime, official ESLint rules, automated tests, content QA, build checks, install ZIP, and a dedicated test-vault generator.
- Live Preview metadata hiding; manual insertion directly from the daily-note editor context menu, with a command for custom hotkeys; Backfill/Deletion labels; the same standalone Ko-fi footer as Everyday Classical Music.

## Milestone status

| Milestone | Current state |
| --- | --- |
| M1 Product and platform baseline | Repository/scaffold and specification implemented. Released registry had no exact ID/name collision on 2026-09-24; this does not reserve the name or cover pending entries. |
| M2 Content/date engine | Structural and automated date checks pass. Similarity samples reviewed; final editorial read-through still pending. |
| M3 Single-note insertion | Implemented and covered by automated tests; actual editor acceptance pending. |
| M4 Automatic behavior/settings | Implemented and mock integration tests pass; actual core-template, settings, restart acceptance pending. |
| M5 Batch operations | Implemented and automated safety tests pass; real modal and large-vault acceptance pending. |
| M6 Platform verification | Incomplete: desktop connection/control unavailable; actual iOS/Android and minimum-version testing pending. |
| M7 Release candidate | Build/packaging/docs prepared. License selection, platform results, actual screenshots, and final editorial review remain. |
| M8 Submission/review | Not started. No public release, community entry, or approval claimed. |
| M9 Store-install verification | Not started; depends on an actual published listing. |

## Artifacts

`npm run package` produces `dist/everyday-wisdom-1.0.0.zip`, separate `main.js`, `manifest.json`, `styles.css`, license/notices, and SHA-256 checksums. The ZIP contains the correct `everyday-wisdom/` plugin folder. Generated binaries are not committed to source control; CI uploads an installation artifact.

`npm run test:vault` prepares an isolated vault. `README.md`, `CHANGELOG.md`, `THIRD_PARTY_NOTICES.md`, `CONTENT_QA_REPORT.md`, and `TESTING.md` are included in the repository. The root `LICENSE` is explicitly a pre-release notice; it is not yet the selected public license.

## Remaining decisions and release gates

1. Run and record the actual desktop, minimum-version, iOS, and Android matrix in [TESTING.md](TESTING.md). Capture real light/dark/narrow-screen images; do not fabricate product screenshots.
2. Complete final editorial review of the selected 366 entries.
3. Owner selects the public license and confirms author identity. Recommended licensing scope is in [LICENSING_PROPOSAL.md](LICENSING_PROPOSAL.md). The owner has requested the same donation footer as Everyday Classical Music; the verified link is `https://ko-fi.com/flyingmarkhor` and is also declared as `fundingUrl`.
4. Review the concrete materials, make the repository public, establish the release default branch, and publish exact tag `1.0.0` with the three separate plugin attachments. No release is published by CI automatically.
5. Sign in to Obsidian Community, connect GitHub, submit the repository under the correct owner, resolve automated review errors, and publish the directory entry.
6. Verify installation from the public Obsidian directory in a fresh vault, using the actual released assets.

The initial source is kept on `feat/initial-plugin`. Do not treat the private development branch as an approved release. Future content changes do not rewrite stored reflections.

## Current official publishing path

Verified against the [official submission guide](https://docs.obsidian.md/plugins/releasing/submit-plugin) and [plugin submission requirements](https://docs.obsidian.md/community-directory/submission-requirements-for-plugins) on 2026-09-24. Submit through **community.obsidian.md** after the GitHub release is ready. The directory reads the default-branch manifest; its version must match the release tag. Upload `main.js`, `manifest.json`, and `styles.css` separately. A ZIP alone is insufficient.

The full Chinese walkthrough is in [DEVELOPMENT_PLAN.zh-CN.md](DEVELOPMENT_PLAN.zh-CN.md). Review timing depends on Obsidian; no approval date is promised.
