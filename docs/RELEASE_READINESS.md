# Everyday Wisdom — release readiness

Updated 2026-09-24 UTC. **Source is public under MIT. The 1.0.0 release is still a draft; community submission and approval are pending.**

Repository: https://github.com/Eloliuyx/everyday-wisdom. The owner requested the same public, MIT-licensed approach as Everyday Classical Music, and the repository was made public on 2026-09-24 UTC. The prepared release remains a draft; see [publishing handoff](PUBLISH.zh-CN.md) and [release notes](releases/1.0.0.md).

The release default branch is `main`; the earlier `feat/initial-plugin` branch is retained as development history.

Author: **the flying markhor**, consistent with the owner's published Everyday Classical Music plugin. The owner approved **MIT for the code and all 366 reflections** on 2026-09-24 UTC.

## Completed

- 366 English reflections, stable month/day mapping and leap-day handling.
- All 366 entries read in calendar order; three final copyedits recorded in [EDITORIAL_REVIEW.md](EDITORIAL_REVIEW.md). Dates, themes, and question counts unchanged.
- Automatic insertion only for daily notes created while the switch is on. No individual manual-insertion command, shortcut, or menu.
- Backfill and Deletion with previews, confirmation, cancellation, changed-note detection, and preservation of personal or edited text.
- Top/bottom placement, metadata hiding in Live Preview, standalone settings introduction, donation footer, and right-aligned modal actions.
- Owner-reported macOS main-workflow acceptance. The supplied Deletion result showed 1 updated, 0 skipped, 0 failed, 0 not processed.
- 54 automated tests, official Obsidian ESLint rules, type checks, content/document consistency checks, runtime import checks, and reproducible packaging.
- Production-dependency audit reported no known vulnerabilities on 2026-09-24 UTC.
- MIT licensing applied to source, documentation, and content; full license and third-party notices included in the bundle and distribution.
- User README, release notes, Chinese submission walkthrough, installation ZIP, separate plugin attachments, and SHA-256 checksums prepared.
- No exact ID/name collision in the published community registry on 2026-09-24 UTC. This does not reserve the name or cover pending submissions.

## Validation limits

The user's main-workflow acceptance is not a pass for every row of [TESTING.md](TESTING.md). Actual iOS/Android, Obsidian 1.13.1, detailed large-vault, offline-app, and cross-device tests remain pending. Minimum 1.13.1 follows the settings API requirements. Mobile compatibility is intended but has not been verified.

The current environment cannot obtain a new assisted UI session: Computer Use permission is unavailable, and the latest CLI check could not locate the running app. The last observed installed desktop version was 1.13.7. No new product screenshots or visual confirmation of the final Done alignment were fabricated. Screenshots are useful release material but are not a required plugin-submission attachment in the current official guide.

## Milestones

| Milestone | State |
| --- | --- |
| M1 Baseline | Complete. |
| M2 Content and dates | Structural checks and full editorial read-through complete. |
| M3–M5 Insertion, settings, batch operations | Implemented, automated checks pass, owner reports the main workflow works. Detailed acceptance remains recorded separately. |
| M6 Platforms | Partial: macOS basic workflow checked by owner; mobile and exact minimum version unverified. |
| M7 Release preparation | License, content, package, README, notes, and GitHub draft prepared. Full platform acceptance and optional screenshots remain. |
| M8 Submission/review | Pending public-release decision, account linking, submission, and actual review results. |
| M9 Store installation | Pending a published listing. |

## Publication steps remaining

1. Review the concrete 1.0.0 materials and outstanding platform coverage. Confirm the intended release scope before publishing.
2. Publish the exact `1.0.0` release in the already-public repository, with `main.js`, `manifest.json`, and `styles.css` as separate attachments. CI does not publish automatically.
3. Sign in to Obsidian Community, link GitHub, submit under the correct owner, and resolve automated-review errors. The owner must accept the developer and maintenance policies.
4. Publish the community entry and verify store installation in a fresh vault.

Current official process verified on 2026-09-24 UTC: [submission guide](https://docs.obsidian.md/plugins/releasing/submit-plugin), [plugin requirements](https://docs.obsidian.md/community-directory/submission-requirements-for-plugins), and [developer policies](https://docs.obsidian.md/community-directory/developer-policies).
