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

    await sharp(sourcePath).rotate()
      .resize({ width: 720, height: 720, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 78, effort: 5, smartSubsample: true })
      .toFile(path.join(galleryOutputDir, thumbName));
    await sharp(sourcePath).rotate()
      .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 84, effort: 5, smartSubsample: true })
      .toFile(path.join(galleryOutputDir, previewName));

    manifest.push({
      file,
      alt: path.parse(file).name,
      width: metadata.width,
      height: metadata.height,
      thumb: `/generated/gallery/${thumbName}`,
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
    sharp(path.join(root, 'src', 'assets', 'site', 'character.png')).rotate()
      .resize({ width: 320, height: 640, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 84, effort: 5, smartSubsample: true })
      .toFile(path.join(siteDir, 'character.webp')),
  ]);
}

await Promise.all([optimizeGallery(), optimizeSiteImages()]);
console.log('Optimized gallery and site images.');
