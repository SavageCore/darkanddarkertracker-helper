import { defineConfig } from 'vite';
import monkey, { cdn } from 'vite-plugin-monkey';
import { version } from './package.json';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    monkey({
      entry: 'src/main.ts',
      userscript: {
        icon: 'https://savagecore.uk/img/userscript_icon.png',
        namespace: 'savagecore.uk',
        match: [
          'https://darkanddarkertracker.com/*',
        ],
        "run-at": "document-end",
        version,
        license: 'Unlicense',
        author: 'SavageCore',
        description: 'A template for userscripts',
        updateURL: 'https://github.com/SavageCore/darkanddarkertracker-helper/releases/latest/download/darkanddarkertracker-helper.meta.js',
        downloadURL: 'https://github.com/SavageCore/darkanddarkertracker-helper/releases/latest/download/darkanddarkertracker-helper.user.js',
        supportURL: 'https://github.com/SavageCore/darkanddarkertracker-helper/issues',
        homepageURL: 'https://github.com/SavageCore/darkanddarkertracker-helper',
      },
      build: {
        externalGlobals: {
          // jszip: cdn.unpkg('JSZip', 'dist/jszip.min.js'),
        },
        metaFileName: true,
      },
    }),
  ],
});
