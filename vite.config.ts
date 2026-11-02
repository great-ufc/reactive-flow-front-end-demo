import { defineConfig } from 'vite';

// Relative paths let the same build run from the site root in development and
// from /reactive-flow-front-end-demo/ on GitHub Pages.
export default defineConfig({
  base: './',
});
