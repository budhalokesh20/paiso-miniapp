const path = require('path');
const { execFileSync } = require('child_process');
const root = path.resolve(__dirname, '..');
execFileSync(process.execPath, [require.resolve('tailwindcss/lib/cli.js'), '-c', path.join(root, 'tailwind.config.cjs'), '-i', path.join(root, 'src/client/utilities.css'), '-o', path.join(root, 'public/utilities.css'), '--minify'], {cwd:root,stdio:'inherit'});
