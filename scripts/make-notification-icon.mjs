/* Genereert het statusbalk-icoon voor de loondag-melding.
   Draaien met: node scripts/make-notification-icon.mjs

   Android tekent een notificatie-icoon als silhouet: alleen het alfakanaal telt, elke kleur wordt
   weggegooid en vervangen door de systeemkleur (of door iconColor uit capacitor.config.json).
   Een gewoon app-icoon levert daarom een witte vlek op. Dit is dus puur het beeldmerk in wit op
   volledig transparant, en zonder de groene achtergrond.

   Vector zou hier ook kunnen, maar minSdk is 23 en op oudere toestellen zijn VectorDrawables in
   notificaties niet betrouwbaar; PNG per dichtheid werkt overal. */
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

/* Dezelfde staafjes als assets/icon-foreground.svg. Het beeldmerk beslaat x 200-824 en y 270-720;
   die staan hier in een vierkant vlak met ruim 8% marge rondom, want een statusbalk-icoon is een
   24dp canvas waarvan de buitenste ~2dp leeg hoort te blijven. Zonder die marge plakt het beeld
   tegen de rand en oogt het groter dan de systeemiconen ernaast. */
const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="136 119 752 752">
  <g fill="#FFFFFF">
    <path d="M200 720 L200 610 Q200 570 240 570 L280 570 Q320 570 320 610 L320 720 Z"/>
    <path d="M368 720 L368 510 Q368 470 408 470 L448 470 Q488 470 488 510 L488 720 Z"/>
    <path d="M536 720 L536 410 Q536 370 576 370 L616 370 Q656 370 656 410 L656 720 Z"/>
    <path d="M704 720 L704 310 Q704 270 744 270 L784 270 Q824 270 824 310 L824 720 Z"/>
  </g>
</svg>`;

/* mdpi is de basis: 24dp = 24px, en elke stap schaalt mee met de schermdichtheid. */
const DENSITIES = { mdpi: 24, hdpi: 36, xhdpi: 48, xxhdpi: 72, xxxhdpi: 96 };
const RES = 'android/app/src/main/res';

for (const [dichtheid, px] of Object.entries(DENSITIES)) {
  const dir = path.join(RES, `drawable-${dichtheid}`);
  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, 'ic_stat_gridlife.png');
  await sharp(Buffer.from(SVG))
    .resize(px, px, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(out);
  console.log(`${out} (${px}x${px})`);
}
