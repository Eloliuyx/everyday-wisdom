# Public licensing proposal — pending owner selection

The project is private and pre-release. `package.json` remains `UNLICENSED`; the root `LICENSE` explicitly grants no redistribution permission for our own files yet. Third-party licensing is independent.

Recommended simple option: use the MIT License for both the plugin source and the bundled English reflection collection. Include the author name `the flying markhor` and year `2026`. This allows downstream reuse, including commercial reuse, subject to the license terms. The owner can instead choose a separate license for the reflection collection before publication.

Before public release, replace the root notice with the selected full license text, update `package.json`, state clearly whether `src/content/wisdom.json` and `docs/CONTENT.md` are included, and regenerate the installation package. Do not publish the current pre-release notice as if an open-source license had already been selected.
