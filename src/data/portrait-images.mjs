export const portraitWidths = [192, 352, 528, 640];

// Match the four Tailwind sizes on the homepage's portrait container.
export const portraitSizes = '(min-width: 924px) 20rem, (min-width: 768px) 16rem, (min-width: 640px) 13rem, 11rem';

/** @param {string} expression */
export function portraitFile(expression, width = 640) {
  const suffix = width === 640 ? '' : `-${width}`;
  return `portrait-${expression.toLowerCase()}${suffix}.webp`;
}

/** @param {string} expression */
export function portraitSources(expression) {
  const directory = '/generated/site/';
  return {
    src: directory + portraitFile(expression),
    srcset: portraitWidths.map(width => `${directory}${portraitFile(expression, width)} ${width}w`).join(', '),
    sizes: portraitSizes,
  };
}
