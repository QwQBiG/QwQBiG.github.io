import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

// Keep Fontsource's Unicode ranges and weights, but don't change code metrics
// after the reader has started scrolling on a slow connection.
const optionalCodeFonts = {
  postcssPlugin: 'optional-code-fonts',
  Declaration: {
    'font-display'(declaration) {
      const stylesheet = declaration.source.input.file ?? '';
      if (declaration.value === 'swap' && /[/\\]@fontsource[/\\]jetbrains-mono[/\\]/.test(stylesheet)) {
        declaration.value = 'optional';
      }
    },
  },
};

export default {
  plugins: [tailwindcss(), autoprefixer(), optionalCodeFonts],
};
