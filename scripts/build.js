require('./build-css');
/**
 * TypeScript + Modular TSX Builder for Paiso Mini App & Admin Panel
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');

// 1. Type-check & compile Backend (src/types.ts + src/server.ts) -> types.js + server.js
execSync('npx tsc -p tsconfig.server.json', { cwd: ROOT, stdio: 'inherit' });

// 2. Type-check & compile Modular TSX Frontend & Admin (src/client/**/*.tsx) -> dist/client/**/*.js
execSync('npx tsc -p tsconfig.client.json', { cwd: ROOT, stdio: 'inherit' });

function stripModuleSyntax(raw) {
  return raw
    .replace(/^\s*import\s+[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, '')
    .replace(/^\s*export\s+(?=function|const|let|var|class)/gm, '')
    .replace(/^\s*export\s*\{[^}]*\};?\s*$/gm, '');
}

// 3. Bundle compiled MiniApp TSX modules -> public/app.js
const clientModules = require('./client-modules');

let appBundle = '(function() {\n"use strict";\n';
for (const relPath of clientModules) {
  const fullPath = path.join(ROOT, relPath);
  const raw = fs.readFileSync(fullPath, 'utf8');
  appBundle += `\n// --- ${relPath.replace('dist/client/', 'src/client/').replace(/\.js$/, '.tsx')} ---\n` + stripModuleSyntax(raw);
}
appBundle += '\n})();\n';
fs.writeFileSync(path.join(ROOT, 'public/app.js'), appBundle);

// 4. Bundle compiled Admin TSX module -> public/admin.js
const adminModules = [
  'dist/client/jsx.js',
  'dist/client/admin/AdminNavigation.js',
  'dist/client/admin/AdminStatCard.js',
  'dist/client/admin/AdminUserEditor.js',
  'dist/client/admin.js'
];

let adminBundle = '(function() {\n"use strict";\n';
for (const relPath of adminModules) {
  const fullPath = path.join(ROOT, relPath);
  const raw = fs.readFileSync(fullPath, 'utf8');
  adminBundle += `\n// --- ${relPath.replace('dist/client/', 'src/client/').replace(/\.js$/, '.tsx')} ---\n` + stripModuleSyntax(raw);
}
adminBundle += '\n})();\n';
fs.writeFileSync(path.join(ROOT, 'public/admin.js'), adminBundle);

console.log('✅ Built server.js, public/app.js, and public/admin.js (Modular TSX)');
