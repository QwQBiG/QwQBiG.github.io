import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { portraitFile, portraitWidths } from '../src/data/portrait-images.mjs';
import { galleryCoverImages } from '../src/data/gallery-cover.mjs';

const root = process.cwd();
const gallerySourceDir = path.join(root, 'src', 'assets', 'gallery');
const generatedDir = path.join(root, 'public', 'generated');
const galleryOutputDir = path.join(generatedDir, 'gallery');
const imageExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif']);
// Clockwise order on the wall. Keep the original numeric IDs for visitors' saved positions.
const galleryEntries = {
  'LongLong.png': { scale: 0.5, alt: 'A sketch of a purple-eyed girl with white hair, striped horns, and small lavender dragon wings.' },
  '2025-08.png': { id: '1', alt: 'Two Minecraft players stand on a flower-lined path outside a wooden house.' },
  'AIcard.png': { id: '2', scale: 0.5, alt: 'A silver-haired figure in profile against the dark grid of a blue-lit window.' },
  'ChengLong.png': { scale: 0.5, alt: 'In a two-panel comic, a white-haired dragon girl searches Google and looks puzzled when Jackie Chan movies fill the screen.' },
  'ZhenXun.jpg': { id: '5', scale: 0.5, alt: 'A pink-haired anime character smiles at the viewer with clasped hands.' },
  'hahaha.png': { id: '3', alt: 'Four cartoon bandmates play guitars and drums in pink, yellow, red, and blue panels.' },
  'Kafka.png': { id: '4', alt: 'Kafka stands beneath dark umbrellas in the rain, with red threads crossing the scene.' },
};

async function writeGalleryThumbnail(image, stem) {
  const webp = `${stem}.webp`;
  const avif = `${stem}.avif`;
  const [metadata] = await Promise.all([
    image.clone().webp({ quality: 78, effort: 5, smartSubsample: true })
      .toFile(path.join(galleryOutputDir, webp)),
    image.clone().avif({ quality: 53, effort: 6, chromaSubsampling: '4:4:4' })
      .toFile(path.join(galleryOutputDir, avif)),
  ]);
  // The 720px bounding box can yield a narrower portrait thumbnail.
  return { width: metadata.width, webp: `/generated/gallery/${webp}`, avif: `/generated/gallery/${avif}` };
}

async function optimizeGallery() {
  await fs.mkdir(galleryOutputDir, { recursive: true });
  const sourceFiles = (await fs.readdir(gallerySourceDir))
    .filter((file) => imageExtensions.has(path.extname(file).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, 'en'));
  const files = [
    ...Object.keys(galleryEntries).filter(file => sourceFiles.includes(file)),
    ...sourceFiles.filter(file => !Object.hasOwn(galleryEntries, file)),
  ];
  const manifest = [];

  for (const file of files) {
    const sourcePath = path.join(gallerySourceDir, file);
    const metadata = await sharp(sourcePath).metadata();
    const stem = path.parse(file).name.replace(/[^a-zA-Z0-9_-]+/g, '-');
    const previewName = `${stem}-1920.webp`;

    const pipeline = sharp(sourcePath).rotate();
    const [thumbnail, preview, placeholder] = await Promise.all([
      writeGalleryThumbnail(
        pipeline.clone().resize({ width: 720, height: 720, fit: 'inside', withoutEnlargement: true }),
        `${stem}-720`,
      ),
      pipeline.clone()
        .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 84, effort: 5, smartSubsample: true })
        .toFile(path.join(galleryOutputDir, previewName)),
      pipeline.clone().resize({ width: 20, height: 20, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 45 }).toBuffer(),
    ]);

    const smallerThumbnails = await Promise.all(
      [120, 180, 256, 360].filter(width => width < thumbnail.width).map(width =>
        writeGalleryThumbnail(pipeline.clone().resize({ width }), `${stem}-w${width}`),
      ),
    );
    const previewUrl = `/generated/gallery/${previewName}`;
    const previewCandidates = await Promise.all(
      [480, 800, 1200].filter(width => preview.width > 720 && width < preview.width).map(async width => {
        const name = `${stem}-preview-${width}.webp`;
        await pipeline.clone().resize({ width })
          .webp({ quality: 84, effort: 5, smartSubsample: true })
          .toFile(path.join(galleryOutputDir, name));
        return `/generated/gallery/${name} ${width}w`;
      }),
    );
    const thumbnails = [...smallerThumbnails, thumbnail];
    manifest.push({
      file,
      id: galleryEntries[file]?.id ?? `file-${Buffer.from(file).toString('base64url')}`,
      scale: galleryEntries[file]?.scale,
      placeholder: `data:image/webp;base64,${placeholder.toString('base64')}`,
      alt: galleryEntries[file]?.alt ?? `Gallery image ${manifest.length + 1}`,
      width: metadata.autoOrient.width,
      height: metadata.autoOrient.height,
      thumb2x: thumbnail.webp,
      srcset: thumbnails.map(image => `${image.webp} ${image.width}w`).join(', '),
      avifSrcset: thumbnails.map(image => `${image.avif} ${image.width}w`).join(', '),
      preview: previewUrl,
      previewWidth: preview.width,
      previewHeight: preview.height,
      previewSrcset: [...previewCandidates, `${previewUrl} ${preview.width}w`].join(', '),
    });
  }

  await fs.writeFile(
    path.join(galleryOutputDir, 'manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf8',
  );
}

async function optimizeSiteImages() {
  const siteDir = path.join(generatedDir, 'site');
  await fs.mkdir(siteDir, { recursive: true });
  await Promise.all([
    sharp(path.join(root, 'public', 'ZhenXun.png')).rotate()
      .resize(160, 160, { fit: 'cover' }).webp({ quality: 82, effort: 5 })
      .toFile(path.join(siteDir, 'avatar-160.webp')),
    ...galleryCoverImages.map(({ width, webp, avif }) => {
      const cover = sharp(path.join(gallerySourceDir, 'hahaha.png')).rotate()
        .resize({ width, height: width * 9 / 16, fit: 'cover' });
      return Promise.all([
        cover.clone().webp({ quality: 78, effort: 5, smartSubsample: true }).toFile(path.join(siteDir, webp)),
        cover.clone().avif({ quality: 53, effort: 6, chromaSubsampling: '4:4:4' }).toFile(path.join(siteDir, avif)),
      ]);
    }),
    ...['character', 'character-happy', 'character-wink', 'character-shy'].map((name) =>
      sharp(path.join(root, 'src', 'assets', 'site', `${name}.png`)).rotate()
      .resize({ width: 768, height: 1152, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 90, effort: 5, smartSubsample: true })
      .toFile(path.join(siteDir, `${name}.webp`)),
    ),
  ]);
}

async function optimizePortraits() {
  const siteDir = path.join(generatedDir, 'site');
  await fs.mkdir(siteDir, { recursive: true });
  const smoothstep = (start, end, value) => {
    const t = Math.max(0, Math.min(1, (value - start) / (end - start)));
    return t * t * (3 - 2 * t);
  };

  for (const expression of ['smile', 'happy', 'wink', 'shy']) {
    const source = expression === 'smile' ? 'character' : `character-${expression}`;
    // Render the upper-body crop and soft paper edges once at build time.
    const { data, info } = await sharp(path.join(root, 'src', 'assets', 'site', `${source}.png`))
      .rotate()
      .extract({ left: 109, top: 0, width: 760, height: 715 })
      .extend({ top: 45, bottom: 0, left: 0, right: 0, background: '#ffffff' })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    for (let y = 0; y < info.height; y++) {
      for (let x = 0; x < info.width; x++) {
        const offset = (y * info.width + x) * info.channels;
        const radius = Math.hypot((x + 0.5) / info.width - 0.5, (y + 0.5) / info.height - 0.5);
        const paper = smoothstep(0.94, 0.995, Math.min(data[offset], data[offset + 1], data[offset + 2]) / 255);
        data[offset + 3] = Math.round(data[offset + 3]
          * (1 - paper * smoothstep(0.16, 0.46, radius))
          * (1 - smoothstep(0.46, 0.5, radius)));
        const glow = (1 - smoothstep(0.35, 0.5, radius)) * 0.08 * 0.9 * 255;
        for (const [channel, color] of [0.527, 0.231, 0.973].entries()) {
          data[offset + channel] = Math.min(255, Math.round(data[offset + channel] + color * glow));
        }
      }
    }

    await Promise.all(portraitWidths.map(async width => {
      const portrait = sharp(data, { raw: info }).resize(width, width);
      const pixels = await portrait.clone().raw().toBuffer();
      // Resize leaves black RGB in fully transparent pixels. Matching the white
      // paper edge compresses better without changing any visible input pixel.
      for (let offset = 0; offset < pixels.length; offset += 4) {
        if (pixels[offset + 3] === 0) pixels.fill(255, offset, offset + 3);
      }
      await Promise.all([
        portrait.clone().webp({ quality: 90, alphaQuality: 100, effort: 5, smartSubsample: true })
          .toFile(path.join(siteDir, portraitFile(expression, width))),
        sharp(pixels, { raw: { width, height: width, channels: 4 } })
          .avif({ quality: 75, effort: 6, chromaSubsampling: '4:4:4' })
          .toFile(path.join(siteDir, portraitFile(expression, width, 'avif'))),
      ]);
    }));
  }
}

await Promise.all([optimizeGallery(), optimizeSiteImages(), optimizePortraits()]);
console.log('Optimized gallery and site images.');
