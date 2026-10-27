const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');

function stripModuleSyntax(raw) {
  return raw
    .replace(/^\s*import\s+[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, '')
    .replace(/^\s*export\s+(?=function|const|let|var|class|type|interface)/gm, '')
    .replace(/^\s*export\s*\{[^}]*\};?\s*$/gm, '');
}

const modules = [
  'dist/client/jsx.js',
  'dist/client/components/Icons.js',
  'dist/client/components/HomeView.js',
  'dist/client/components/TasksView.js',
  'dist/client/components/GamesView.js',
  'dist/client/components/FriendsView.js',
  'dist/client/components/SettingsView.js',
  'dist/client/components/BottomNav.js',
  'dist/client/app.js'
];

let bundle = '(function() {\n"use strict";\n';
for (const relPath of modules) {
  bundle += `\n// --- ${relPath.replace('dist/client/', 'src/client/').replace(/\.js$/, '.tsx')} ---\n`;
  bundle += stripModuleSyntax(fs.readFileSync(path.join(root, relPath), 'utf8'));
}
fs.writeFileSync(path.join(root, 'public/app.js'), bundle + '\n})();\n');
