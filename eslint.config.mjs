import obsidian from 'eslint-plugin-obsidianmd';

export default [
  ...obsidian.configs.recommended,
  { languageOptions: { parserOptions: { projectService: true } } },
  { ignores: ['node_modules/**', 'main.js', 'dist/**', 'tests/**', 'scripts/**'] },
];
