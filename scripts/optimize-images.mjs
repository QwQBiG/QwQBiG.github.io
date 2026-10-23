import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const gallerySourceDir = path.join(root, 'src', 'assets', 'gallery');
const generatedDir = path.join(root, 'public', 'generated');
const galleryOutputDir = path.join(generatedDir, 'gallery');
const imageExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif']);

async function optimizeGallery() {
  await fs.mkdir(galleryOutputDir, { recursive: true });
  const files = (await fs.readdir(gallerySourceDir))
    .filter((file) => imageExtensions.has(path.extname(file).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, 'en'));
  const manifest = [];

  for (const file of files) {
    const sourcePath = path.join(gallerySourceDir, file);
    const metadata = await sharp(sourcePath).metadata();
    const stem = path.parse(file).name.replace(/[^a-zA-Z0-9_-]+/g, '-');
    const thumbName = `${stem}-720.webp`;
    const previewName = `${stem}-1920.webp`;

    const pipeline = sharp(sourcePath).rotate();
    await Promise.all([
      pipeline.clone()
        .resize({ width: 720, height: 720, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 78, effort: 5, smartSubsample: true })
        .toFile(path.join(galleryOutputDir, thumbName)),
      pipeline.clone()
        .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 84, effort: 5, smartSubsample: true })
        .toFile(path.join(galleryOutputDir, previewName)),
    ]);

    manifest.push({
      file,
      alt: path.parse(file).name,
      width: metadata.width,
      height: metadata.height,
      thumb2x: `/generated/gallery/${thumbName}`,
      preview: `/generated/gallery/${previewName}`,
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
    sharp(path.join(gallerySourceDir, 'hahaha.png')).rotate()
      .resize({ width: 640, height: 360, fit: 'cover' })
      .webp({ quality: 78, effort: 5, smartSubsample: true })
      .toFile(path.join(siteDir, 'gallery-cover-640.webp')),
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

    await sharp(data, { raw: info })
      .resize(640, 640)
      .webp({ quality: 90, alphaQuality: 100, effort: 5, smartSubsample: true })
      .toFile(path.join(siteDir, `portrait-${expression}.webp`));
  }
}

await Promise.all([optimizeGallery(), optimizeSiteImages(), optimizePortraits()]);
console.log('Optimized gallery and site images.');
