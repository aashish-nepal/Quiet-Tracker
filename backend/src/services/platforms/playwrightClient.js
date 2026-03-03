import { chromium } from 'playwright';

export async function fetchRenderedHtml(url) {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    return await page.content();
  } finally {
    await browser.close();
  }
}
