# Everyday Wisdom — release readiness

Updated 2026-09-24 UTC. **Source is public under MIT. GitHub 1.0.0 and the community listing are published. Official automated review passed and Add to Obsidian is available; a fresh-vault store installation check remains.**

Repository: https://github.com/Eloliuyx/everyday-wisdom. The owner requested the same public, MIT-licensed approach as Everyday Classical Music, and the repository was made public on 2026-09-24 UTC. [Release 1.0.0](https://github.com/Eloliuyx/everyday-wisdom/releases/tag/1.0.0) was published at 04:46:06 UTC that day, from commit `6548b3ec726b2890432e142fd31427e3f3d1dc26`. See [publishing handoff](PUBLISH.zh-CN.md) and [release notes](releases/1.0.0.md).

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
- Seven public release attachments downloaded anonymously and verified against the local package and SHA-256 checksums. The ZIP contains the expected five plugin files; the published tag is synced locally.
- Published source, bundle, README disclosures, and licensing checked against developer policies; no violation identified. See [POLICY_REVIEW.md](POLICY_REVIEW.md). This is not an official approval.
- The owner completed community submission. At 04:58 UTC on 2026-09-24, the management page showed Completed for 1.0.0, commit `6548b3e`. The [public listing](https://community.obsidian.md/plugins/everyday-wisdom) showed Health Excellent, Review Passed, and an enabled Add to Obsidian link. There were no Errors or Warnings; three non-blocking Recommendations are recorded in [POLICY_REVIEW.md](POLICY_REVIEW.md).

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
| M7 Release preparation | License, content, package, README, and notes complete. GitHub 1.0.0 published and public downloads verified. Full platform acceptance and optional screenshots remain. |
| M8 Submission/review | Complete. Official automated review passed for 1.0.0 with no Errors or Warnings. |
| M9 Store installation | Listing is live and Add to Obsidian is available. A fresh-vault installation and workflow check remains unverified. |

## Publication steps remaining

1. Use the public Add to Obsidian link and verify installation and core workflows in a fresh vault. No additional Publish action was required in the observed submission flow.

Current official process verified on 2026-09-24 UTC: [submission guide](https://docs.obsidian.md/plugins/releasing/submit-plugin), [plugin requirements](https://docs.obsidian.md/community-directory/submission-requirements-for-plugins), and [developer policies](https://docs.obsidian.md/community-directory/developer-policies).
