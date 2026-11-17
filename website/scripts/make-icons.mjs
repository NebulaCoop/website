// Renders the site icons in public/ from assets/brand/nebulacoop-mark.svg. Run `npm run icons` after changing it.
import sharp from 'sharp';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const svg = await readFile(resolve(root, 'assets/brand/nebulacoop-mark.svg'));
const png = (size) =>
  sharp(svg, { density: 72 * (size / 64) * 2 })
    .resize(size, size)
    .png()
    .toBuffer();

const sizes = {
  'brand-logo.png': 68,
  'favicon-32.png': 32,
  'apple-touch-icon.png': 180,
  'icon-192.png': 192,
};
for (const [name, size] of Object.entries(sizes))
  await writeFile(resolve(root, 'public', name), await png(size));

// favicon.ico: one 32x32 PNG inside an ICO container.
const image = await png(32);
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);
header.writeUInt8(32, 6);
header.writeUInt8(32, 7);
header.writeUInt16LE(1, 10);
header.writeUInt16LE(32, 12);
header.writeUInt32LE(image.length, 14);
header.writeUInt32LE(22, 18);
await writeFile(resolve(root, 'public/favicon.ico'), Buffer.concat([header, image]));
// The cursor: the star pointer, and a glowing one over links and buttons. Browsers use the SVG and fall back to
// the PNG; both are 32x32 with the hotspot in the star's centre, as in the game.
await mkdir(resolve(root, 'public/cursor'), { recursive: true });
for (const name of ['star-pointer', 'star-pointer-hover']) {
  const source = await readFile(resolve(root, `assets/brand/${name}.svg`));
  await writeFile(resolve(root, `public/cursor/${name}.svg`), source);
  await writeFile(
    resolve(root, `public/cursor/${name}.png`),
    await sharp(source, { density: 144 }).resize(32, 32).png().toBuffer(),
  );
}
console.log('Icons and cursors written to public/.');
