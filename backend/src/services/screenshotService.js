import fs from 'fs/promises';
import path from 'path';

import { chromium } from 'playwright';
import { env } from '../config/env.js';

/**
 * Upload a PNG buffer to S3 and return the public URL.
 * Requires S3_BUCKET, S3_REGION env vars and standard AWS credentials
 * (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY or instance role).
 */
async function uploadToS3(buffer, productId) {
  // Dynamic import so the app still boots without @aws-sdk installed
  let S3Client, PutObjectCommand;
  try {
    const mod = await import('@aws-sdk/client-s3');
    S3Client = mod.S3Client;
    PutObjectCommand = mod.PutObjectCommand;
  } catch {
    throw new Error('@aws-sdk/client-s3 is required for S3 screenshot storage. Run: npm i @aws-sdk/client-s3');
  }

  const bucket = process.env.S3_BUCKET;
  const region = process.env.S3_REGION || 'us-east-1';
  if (!bucket) throw new Error('S3_BUCKET env var is required for S3 screenshot storage');

  const key = `screenshots/${productId}/${Date.now()}.png`;
  const client = new S3Client({ region });

  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: 'image/png'
  }));

  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

export async function captureProductScreenshot({ productId, url }) {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch (err) {
    // Playwright / Chromium may not be available in all deployment environments.
    // Fail gracefully so a missing browser never crashes a price-check job.
    console.warn('[screenshot] Browser launch failed — screenshots disabled:', err?.message);
    return null;
  }

  try {
    const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    // S3 mode — upload and return a URL
    if (env.screenshotStorageMode === 's3') {
      const imageBuffer = await page.screenshot({ fullPage: true, type: 'png' });
      return await uploadToS3(imageBuffer, productId);
    }

    // Inline mode — base64 data URL (used in production when S3 not configured)
    if (env.screenshotStorageMode === 'inline') {
      const imageBuffer = await page.screenshot({ fullPage: true, type: 'png' });
      return `data:image/png;base64,${imageBuffer.toString('base64')}`;
    }

    // File mode — local disk (development only)
    const dir = path.resolve(env.screenshotStorageDir, productId);
    const fileName = `${Date.now()}.png`;
    const absolutePath = path.join(dir, fileName);

    await fs.mkdir(dir, { recursive: true });
    await page.screenshot({ path: absolutePath, fullPage: true });
    return absolutePath;
  } catch (err) {
    console.warn('[screenshot] Capture failed, skipping screenshot:', err?.message);
    return null;
  } finally {
    await browser.close().catch(() => { });
  }
}

export async function readScreenshotAsBase64(pathname) {
  if (!pathname) return null;

  // S3 URL or inline data URL — download the image bytes
  if (pathname.startsWith('https://') || pathname.startsWith('http://')) {
    try {
      const res = await fetch(pathname);
      const buf = Buffer.from(await res.arrayBuffer());
      return buf.toString('base64');
    } catch {
      return null;
    }
  }

  if (pathname.startsWith('data:image/')) {
    const marker = 'base64,';
    const index = pathname.indexOf(marker);
    return index >= 0 ? pathname.slice(index + marker.length) : null;
  }

  const buf = await fs.readFile(pathname);
  return buf.toString('base64');
}

