import { mkdir, copyFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const out = join(root, 'www');
const files = [
  'index.html',
  'manifest.webmanifest',
  'sw.js',
  'icon.svg',
  'icon-maskable.svg',
  'nunito.woff2',
  // PDF-export libs: horen bij de bron in root, anders breekt "Overzicht als PDF" zodra www opnieuw wordt opgebouwd.
  'jspdf.umd.min.js',
  'jspdf.plugin.autotable.min.js'
];

await mkdir(out, { recursive: true });
for (const file of files) {
  await copyFile(join(root, file), join(out, file));
}
