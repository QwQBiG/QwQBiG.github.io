import site from './tailwind.config.mjs';

export default {
  ...site,
  // Include shared components and client-side states as well as the initial markup.
  content: [
    './src/pages/index.astro',
    './src/components/**/*.{astro,js,jsx,mjs,ts,tsx}',
    './src/{scripts,utils,data}/**/*.{js,mjs,ts}',
  ],
};
