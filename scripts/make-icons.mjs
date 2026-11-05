// Regenerates this app's logo files. The results are committed, so this only needs to run when the logo changes:
//   node scripts/make-icons.mjs
import { mkdirSync, writeFileSync } from "fs";
import { dirname } from "path";
import sharp from "sharp";

const GLYPH = `
    <path d="M152 92h208l96 118-200 234L56 210z" fill="#7c3aed"/>
    <path d="M152 92h208l-48 118H200z" fill="#c084fc"/>
    <path d="M152 92L56 210h144z" fill="#a855f7"/>
    <path d="M360 92l96 118H312z" fill="#9333ea"/>
    <path d="M56 210h144l56 234z" fill="#6d28d9"/>
    <path d="M200 210h112l-56 234z" fill="#a855f7"/>
    <path d="M312 210h144L256 444z" fill="#5b21b6"/>
    <path d="M214 124l-30 58" stroke="#f5e8ff" stroke-width="16" stroke-linecap="round" opacity="0.85"/>
    <path d="M152 92h208l96 118-200 234L56 210z" fill="none" stroke="#22d3ee" stroke-width="10" stroke-linejoin="round" opacity="0.8"/>
  `;

// scale shrinks the symbol inside the tile. rounded leaves see-through corners, for browsers. iOS and
// Android crop icons themselves, so theirs stay square.
const svg = (scale, rounded) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <radialGradient id="bg" cx="50%" cy="38%" r="75%"><stop offset="0" stop-color="#241a3d"/><stop offset="1" stop-color="#0a0a12"/></radialGradient>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#22d3ee"/><stop offset="0.5" stop-color="#a855f7"/><stop offset="1" stop-color="#f472b6"/></linearGradient>
  </defs>
  <rect width="512" height="512" rx="${rounded ? 104 : 0}" fill="url(#bg)"/>
  <g transform="translate(256 256) scale(${scale}) translate(-256 -256)">${GLYPH}</g>
</svg>`);

// A .ico file that wraps PNGs, which every current browser and Windows accepts.
async function ico(file) {
  const sizes = [16, 32, 48, 256];
  const images = await Promise.all(sizes.map(s => sharp(svg(0.9, true)).resize(s, s).png().toBuffer()));
  const head = Buffer.alloc(6 + 16 * sizes.length);
  head.writeUInt16LE(1, 2);
  head.writeUInt16LE(sizes.length, 4);
  let offset = head.length;
  sizes.forEach((s, i) => {
    const e = 6 + 16 * i;
    head[e] = s === 256 ? 0 : s;
    head[e + 1] = s === 256 ? 0 : s;
    head.writeUInt16LE(1, e + 4);
    head.writeUInt16LE(32, e + 6);
    head.writeUInt32LE(images[i].length, e + 8);
    head.writeUInt32LE(offset, e + 12);
    offset += images[i].length;
  });
  writeFileSync(file, Buffer.concat([head, ...images]));
}

const OUT = [["public/favicon.png", 256, "any"], ["app/favicon.png", 256, "any"], ["public/icon-192.png", 192, "any"], ["public/icon-512.png", 512, "any"], ["public/apple-touch-icon.png", 180, "full"], ["public/icons/icon-192x192.png", 192, "any"], ["public/icons/icon-512x512.png", 512, "any"], ["public/icons/apple-touch-icon-180x180.png", 180, "full"], ["public/icons/icon-maskable-512x512.png", 512, "mask"]];
for (const [file, size, kind] of OUT) {
  mkdirSync(dirname(file), { recursive: true });
  const scale = kind === "mask" ? 0.66 : 0.82;
  await sharp(svg(scale, kind === "any")).resize(size, size).png({ compressionLevel: 9 }).toFile(file);
  console.log(file);
}
await ico("app/favicon.ico");
mkdirSync("public/icons", { recursive: true });
writeFileSync("public/icons/logo.svg", svg(0.82, true));
