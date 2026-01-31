# figma-make-repo-fixer

Adds missing config files to run Figma Make apps locally.

When you export a Figma Make app, the repo is missing config files. If you clone from GitHub, the [image assets are also base64-encoded text instead of valid images](https://forum.figma.com/report-a-problem-6/after-exporting-the-project-from-figma-make-to-github-the-images-are-broken-46916). This repo adds the missing pieces.

## What's included

- Vite config with a plugin that resolves `figma:asset/` imports
- TypeScript configs
- Asset fixer script that converts base64-encoded images to binary (GitHub clone only)

## Usage

The commands below use [tiged](https://github.com/tiged/tiged) to download this repo's files into your project folder.

> **Note:** The `--force` flag overwrites existing files. The fixer replaces config files like `vite.config.ts` and `tsconfig.json`.

### Option A: From GitHub export

```bash
git clone https://github.com/your-username/your-figma-make-project.git
cd your-figma-make-project
npx tiged gergelyszerovay/figma-make-repo-fixer --force
node ./fix-figma-asset-files.js
npm install
npm run dev
```

### Option B: From source ZIP

```bash
unzip your-figma-make-project.zip
cd your-figma-make-project
npx tiged gergelyszerovay/figma-make-repo-fixer --force
npm install
npm run dev
```

## Asset fixer

The `fix-figma-asset-files.js` script scans `src/assets` for image files that are actually base64 text, then converts them to proper binary. It shows what it found and asks for confirmation before overwriting.

Only needed when cloning from GitHub. The ZIP download has normal image files.

Supports PNG, JPG, GIF, SVG, and WebP.
