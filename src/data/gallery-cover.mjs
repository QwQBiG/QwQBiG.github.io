export const galleryCoverImages = [256, 480, 640].map(width => ({
  width,
  webp: `gallery-cover-${width}.webp`,
  avif: `gallery-cover-${width}.avif`,
}));

/** @param {'webp'|'avif'} format */
export function galleryCoverSrcset(format) {
  return galleryCoverImages.map(image => `/generated/site/${image[format]} ${image.width}w`).join(', ');
}
