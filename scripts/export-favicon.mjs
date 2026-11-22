// Export browser-sized icons from the approved crest artwork. Development only.
import { readFile, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const source = await readFile(new URL('../public/assets/anthurium-crest-red.png', import.meta.url));
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage();
  for (const [size, name] of [[32, 'favicon-32.png'], [64, 'favicon-64.png'], [180, 'apple-touch-icon.png']]) {
    const data = await page.evaluate(async ({ source, size }) => {
      const image = new Image();
      image.src = source;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = size;
      const context = canvas.getContext('2d');
      context.imageSmoothingQuality = 'high';
      context.drawImage(image, 0, 0, size, size);
      return canvas.toDataURL('image/png').split(',')[1];
    }, { source: `data:image/png;base64,${source.toString('base64')}`, size });
    await writeFile(new URL(`../public/assets/${name}`, import.meta.url), Buffer.from(data, 'base64'));
    console.log(`Exported ${name} (${size} × ${size})`);
  }
} finally {
  await browser.close();
}
