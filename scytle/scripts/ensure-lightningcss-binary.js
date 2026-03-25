const fs = require('node:fs');
const path = require('node:path');

const rootDir = path.resolve(__dirname, '..');

if (process.platform !== 'win32' || process.arch !== 'x64') {
  process.exit(0);
}

const binaries = [
  {
    name: 'lightningcss',
    source: path.join(
      rootDir,
      'node_modules',
      'lightningcss-win32-x64-msvc',
      'lightningcss.win32-x64-msvc.node'
    ),
    target: path.join(
      rootDir,
      'node_modules',
      'lightningcss',
      'lightningcss.win32-x64-msvc.node'
    ),
  },
  {
    name: '@tailwindcss/oxide',
    source: path.join(
      rootDir,
      'node_modules',
      '@tailwindcss',
      'oxide-win32-x64-msvc',
      'tailwindcss-oxide.win32-x64-msvc.node'
    ),
    target: path.join(
      rootDir,
      'node_modules',
      '@tailwindcss',
      'oxide',
      'tailwindcss-oxide.win32-x64-msvc.node'
    ),
  },
];

for (const binary of binaries) {
  if (fs.existsSync(binary.target)) {
    continue;
  }

  if (!fs.existsSync(binary.source)) {
    console.warn(`WARNING: ${binary.name} source binary is missing:`, binary.source);
    continue;
  }

  fs.copyFileSync(binary.source, binary.target);
  console.log(`Restored ${binary.name} native binary:`, binary.target);
}
