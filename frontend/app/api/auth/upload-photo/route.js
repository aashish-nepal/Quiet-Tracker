import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_INLINE_FILE_SIZE_BYTES = 1024 * 1024;
const MIME_TO_EXT = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif'
};

export async function POST(request) {
  try {
    const uploadMode =
      String(process.env.PROFILE_UPLOAD_MODE || '').toLowerCase() === 'disk' ? 'disk' : 'inline';
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file.arrayBuffer !== 'function') {
      return NextResponse.json({ error: 'Image file is required' }, { status: 400 });
    }

    const ext = MIME_TO_EXT[file.type];
    if (!ext) {
      return NextResponse.json({ error: 'Only JPG, PNG, WEBP, or GIF images are supported' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: 'Image must be 5MB or smaller' }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());

    if (uploadMode === 'inline') {
      if (file.size > MAX_INLINE_FILE_SIZE_BYTES) {
        return NextResponse.json({ error: 'Inline profile image must be 1MB or smaller' }, { status: 400 });
      }
      const url = `data:${file.type};base64,${bytes.toString('base64')}`;
      return NextResponse.json({ url });
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'profiles');
    await mkdir(uploadsDir, { recursive: true });

    const fileName = `${Date.now()}-${randomUUID()}${ext}`;
    const filePath = path.join(uploadsDir, fileName);
    await writeFile(filePath, bytes);

    const origin = new URL(request.url).origin;
    const url = `${origin}/uploads/profiles/${fileName}`;
    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}
