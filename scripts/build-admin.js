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
  'dist/client/admin/AdminNavigation.js',
  'dist/client/admin/AdminStatCard.js',
  'dist/client/admin/AdminUserEditor.js',
  'dist/client/admin.js'
];
let bundle = '(function() {\n"use strict";\n';
for (const relPath of modules) {
  bundle += '\n' + stripModuleSyntax(fs.readFileSync(path.join(root, relPath), 'utf8'));
}
fs.writeFileSync(path.join(root, 'public/admin.js'), bundle + '\n})();\n');