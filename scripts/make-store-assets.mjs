/* Genereert de grafische items voor de Google Play Store-vermelding.
   Draaien met: node scripts/make-store-assets.mjs
   Bron is assets/icon-only.png en dezelfde vormen/kleuren als het app-icoon,
   zodat de Store-pagina en het icoon op de telefoon één geheel vormen. */
import sharp from 'sharp';
import fs from 'fs';

const OUT = 'store';
fs.mkdirSync(OUT, { recursive: true });

const kb = f => (fs.statSync(f).size / 1024).toFixed(0);

/* ---- 1. App-icoon 512x512 ------------------------------------------------
   Alpha wordt platgeslagen: Play legt zelf een afgerond masker over het icoon
   en transparante hoeken kunnen daarbij zwart of wit doorschijnen. */
const iconOut = `${OUT}/GridLife-icon-512.png`;
await sharp('assets/icon-only.png')
  .resize(512, 512, { fit: 'cover', kernel: 'lanczos3' })
  .flatten({ background: '#1A5537' })
  .png({ compressionLevel: 9 })
  .toFile(iconOut);

/* ---- 2. Functieafbeelding 1024x500 --------------------------------------
   Tekst blijft ruim binnen de randen; Play kan de banner op sommige plekken
   bijsnijden en legt er soms een afspeelknop overheen. */
const featSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500" viewBox="0 0 1024 500">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.9" y2="1">
      <stop offset="0" stop-color="#40C77E"/>
      <stop offset="0.55" stop-color="#2E7D4F"/>
      <stop offset="1" stop-color="#1A5537"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="500" fill="url(#bg)"/>
  <g fill="#FFFFFF" transform="translate(74,142) scale(0.44)">
    <path d="M0 450 L0 340 Q0 300 40 300 L80 300 Q120 300 120 340 L120 450 Z"/>
    <path d="M168 450 L168 240 Q168 200 208 200 L248 200 Q288 200 288 240 L288 450 Z"/>
    <path d="M336 450 L336 140 Q336 100 376 100 L416 100 Q456 100 456 140 L456 450 Z"/>
    <path d="M504 450 L504 40 Q504 0 544 0 L584 0 Q624 0 624 40 L624 450 Z"/>
  </g>
  <text x="394" y="248" font-family="Verdana, DejaVu Sans, sans-serif" font-size="84" font-weight="bold" fill="#FFFFFF">GridLife</text>
  <text x="398" y="312" font-family="Verdana, DejaVu Sans, sans-serif" font-size="30" fill="#FFFFFF" fill-opacity="0.93">Werkuren, vaste lasten en loon</text>
  <text x="398" y="362" font-family="Verdana, DejaVu Sans, sans-serif" font-size="24" fill="#FFFFFF" fill-opacity="0.72">Jouw administratie, op je eigen telefoon</text>
</svg>`;

const featOut = `${OUT}/GridLife-functieafbeelding-1024x500.png`;
await sharp(Buffer.from(featSvg))
  .flatten({ background: '#1A5537' })
  .png({ compressionLevel: 9 })
  .toFile(featOut);

for (const f of [iconOut, featOut]) {
  const m = await sharp(f).metadata();
  console.log(`${f.padEnd(48)} ${m.width}x${m.height}  alpha:${!!m.hasAlpha}  ${kb(f)} KB`);
}
