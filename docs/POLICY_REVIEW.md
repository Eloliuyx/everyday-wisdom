# Developer-policy review — published 1.0.0

Reviewed on 2026-09-24 UTC against the [Developer policies](https://docs.obsidian.md/community-directory/developer-policies) and [plugin submission requirements](https://docs.obsidian.md/community-directory/submission-requirements-for-plugins).

Scope: published tag `1.0.0`, source commit `6548b3ec726b2890432e142fd31427e3f3d1dc26`, public release assets, manifest, README, and license notices. The downloaded `main.js` SHA-256 is `eafe74a365608c8c039252f98ee896741dfe021a3ec6e4ecc47ba288aa34df1e`.

**Finding: no developer-policy violation identified in this review.** This is a project review, not an approval from Obsidian, and does not replace the pending platform tests or the directory's automated review.

| Policy area | Evidence and finding |
| --- | --- |
| Code transparency | TypeScript source and build configuration are public. esbuild performs normal minification and tree shaking; no separate obfuscator, dynamic code evaluation, or hidden loader was found. The locally prepared artifacts matched a clean GitHub build byte for byte. This review interprets ordinary size reduction with public, reproducible source as distinct from obfuscation intended to hide purpose. |
| Advertising | No dynamic ad loading or ads injected outside the plugin interface. The optional Ko-fi support button appears in the plugin's own settings page and is disclosed in the README. |
| Telemetry | No client-side analytics, event reporting, or server-side service is implemented. The published bundle contains no fetch, requestUrl, XMLHttpRequest, WebSocket, or sendBeacon call. The code review agrees with that screening result; string scanning alone is not a general security proof. |
| Self-installation/updates | No runtime installer or updater. npm/build/test scripts are development tooling and are not invoked by the installed plugin. |
| Required disclosures | All features work without payment or a plugin account. Content and helper code are bundled. README explains the two external links: GitHub help and optional Ko-fi, opened only after a click, without sending note content. |
| File access | Runtime note access goes through Obsidian vault/editor APIs; settings use the plugin settings API. No access to files outside the vault or runtime filesystem module was found. |
| Licensing | The project's MIT license covers code, documentation, and all reflections. Helper and adapted-footer MIT notices are retained in the installed JavaScript and distribution. The README links the license and third-party notices. |
| Trademark | Everyday Wisdom is presented as a community plugin, not an official Obsidian product. |
| Forks and attribution | This is a separate plugin implementation and repository. The owner specifically requested adapting the support footer from their own Everyday Classical Music plugin. That limited reuse is identified and its original MIT copyright notice retained; the project is not a renamed fork of the music plugin. |
| Plugin-specific requirements | The manifest contains a valid fundingUrl for Ko-fi, a short action-oriented description, and an API-based minimum version. Command IDs do not repeat the plugin ID. Runtime external imports are only obsidian and the two host-provided CodeMirror modules; there are no Node/Electron runtime imports. |

## Owner commitment at submission

The submission form requires the owner to personally accept the developer policies and commit to ongoing support, or remove/transfer the plugin if continued support is no longer possible. These are future commitments the code review cannot make on the owner's behalf. The prepared form leaves those checkboxes for the owner.

Actual iOS/Android, minimum-version, offline-app, and detailed compatibility checks remain documented in [TESTING.md](TESTING.md). No official review result or community-directory approval is claimed here.
