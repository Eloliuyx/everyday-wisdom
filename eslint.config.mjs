import obsidian from 'eslint-plugin-obsidianmd';

export default [
  ...obsidian.configs.recommended,
  { languageOptions: { parserOptions: { projectService: true } } },
  {
    files: ['src/settings.ts'],
    // Preserve the author's established support-button name.
    rules: { 'obsidianmd/ui/sentence-case': ['warn', { ignoreWords: ['Markhor'] }] },
  },
  { ignores: ['node_modules/**', 'main.js', 'dist/**', 'tests/**', 'scripts/**'] },
];
