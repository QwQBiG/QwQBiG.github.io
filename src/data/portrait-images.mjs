export const portraitWidths = [192, 352, 528, 640];

// Match the four Tailwind sizes on the homepage's portrait container.
export const portraitSizes = '(min-width: 924px) 20rem, (min-width: 768px) 16rem, (min-width: 640px) 13rem, 11rem';

/** @param {string} expression @param {number} width @param {'webp'|'avif'} format */
export function portraitFile(expression, width = 640, format = 'webp') {
  const suffix = width === 640 ? '' : `-${width}`;
  return `portrait-${expression.toLowerCase()}${suffix}.${format}`;
}

/** @param {string} expression @param {'webp'|'avif'} format */
export function portraitSources(expression, format = 'webp') {
  const directory = '/generated/site/';
  return {
    src: directory + portraitFile(expression, 640, format),
    srcset: portraitWidths.map(width => `${directory}${portraitFile(expression, width, format)} ${width}w`).join(', '),
    sizes: portraitSizes,
  };
}
