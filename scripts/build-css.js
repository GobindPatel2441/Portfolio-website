/**
 * Deterministic CSS Bundler & Minifier
 * Combines fonts.css, main.css, components.css, animations.css, ambient-audio.css, certificates.css, and responsive.css
 * into MyWebsite/css/bundle.min.css.
 */
const fs = require('fs');
const path = require('path');

const cssDir = path.join(__dirname, '..', 'MyWebsite', 'css');

// Order of concatenation:
// 1. fonts.css: Self-contained @font-face declarations and fallbacks
// 2. main.css: Design tokens, CSS variables, base styles
// 3. components.css: Navbar, cards, buttons, badges, modals, terminal
// 4. animations.css: Keyframes, transitions, shimmer, reduced-motion
// 5. ambient-audio.css: Audio pill, popover, volume visualizer
// 6. certificates.css: Certifications grid, filters, preview modal
// 7. responsive.css: Media queries and responsive reflows across breakpoints
const files = [
  'fonts.css',
  'main.css',
  'components.css',
  'animations.css',
  'ambient-audio.css',
  'certificates.css',
  'responsive.css'
];

function minify(css) {
  // Strip comments
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');
  // Normalize whitespace
  css = css.replace(/\s+/g, ' ');
  // Remove whitespace around symbols
  css = css.replace(/\s*([\{\}\:\;\,])\s*/g, '$1');
  // Remove trailing semicolons before closing braces
  css = css.replace(/;\}/g, '}');
  return css.trim();
}

let combined = '';
for (const f of files) {
  const filePath = path.join(cssDir, f);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    combined += `\n/* --- ${f} --- */\n` + content + '\n';
  } else {
    console.warn(`Warning: file not found: ${filePath}`);
  }
}

const minified = minify(combined);
const targetPath = path.join(cssDir, 'bundle.min.css');
fs.writeFileSync(targetPath, minified, 'utf-8');

console.log(`Successfully built bundle.min.css (${minified.length} bytes) from ${files.length} files.`);
