import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

export type ProcessResult = {
  urlMedium?: string;
  urlLow?: string;
  sizeMedium?: number;
  sizeLow?: number;
};

const IMAGE_EXT = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const VIDEO_EXT = ['.mp4', '.webm', '.mov', '.avi', '.mkv'];

function isImage(mime: string, filePath: string): boolean {
  if (mime.startsWith('image/')) return true;
  const ext = path.extname(filePath).toLowerCase();
  return IMAGE_EXT.includes(ext);
}

function isVideo(mime: string, filePath: string): boolean {
  if (mime.startsWith('video/')) return true;
  const ext = path.extname(filePath).toLowerCase();
  return VIDEO_EXT.includes(ext);
}

function baseNameWithoutExt(filePath: string): string {
  const base = path.basename(filePath);
  const ext = path.extname(base);
  return ext ? base.slice(0, -ext.length) : base;
}

/**
 * Create medium and low image variants using Sharp.
 * Original file is left unchanged (url stays as original).
 */
async function processImage(filePath: string, mime: string): Promise<ProcessResult> {
  const base = baseNameWithoutExt(filePath);
  const ext = path.extname(filePath).toLowerCase() || '.jpg';
  const outFormat = ext === '.png' || ext === '.gif' ? 'png' : ext === '.webp' ? 'webp' : 'jpeg';
  const result: ProcessResult = {};

  try {
    const meta = await sharp(filePath).metadata();
    const w = meta.width ?? 1920;
    const h = meta.height ?? 1080;

    const mediumPath = path.join(UPLOAD_DIR, `${base}-medium${ext}`);
    const medW = Math.min(w, 1200);
    const medH = Math.round((h / w) * medW);
    let mediumPipe = sharp(filePath).resize(medW, medH, { fit: 'inside', withoutEnlargement: true });
    if (outFormat === 'jpeg') mediumPipe = mediumPipe.jpeg({ quality: 80 });
    else if (outFormat === 'webp') mediumPipe = mediumPipe.webp({ quality: 80 });
    else mediumPipe = mediumPipe.png({ compressionLevel: 6 });
    await mediumPipe.toFile(mediumPath);
    result.urlMedium = '/uploads/' + path.basename(mediumPath);
    result.sizeMedium = fs.statSync(mediumPath).size;

    const lowPath = path.join(UPLOAD_DIR, `${base}-low${ext}`);
    const lowW = Math.min(w, 600);
    const lowH = Math.round((h / w) * lowW);
    let lowPipe = sharp(filePath).resize(lowW, lowH, { fit: 'inside', withoutEnlargement: true });
    if (outFormat === 'jpeg') lowPipe = lowPipe.jpeg({ quality: 55 });
    else if (outFormat === 'webp') lowPipe = lowPipe.webp({ quality: 55 });
    else lowPipe = lowPipe.png({ compressionLevel: 8 });
    await lowPipe.toFile(lowPath);
    result.urlLow = '/uploads/' + path.basename(lowPath);
    result.sizeLow = fs.statSync(lowPath).size;
  } catch (err) {
    console.error('Image processing error:', err);
  }
  return result;
}

/**
 * Create medium and low video variants using FFmpeg.
 * Requires ffmpeg to be installed on the system.
 */
function processVideo(filePath: string): Promise<ProcessResult> {
  const base = baseNameWithoutExt(filePath);
  const ext = path.extname(filePath).toLowerCase() || '.mp4';
  const mediumPath = path.join(UPLOAD_DIR, `${base}-medium${ext}`);
  const lowPath = path.join(UPLOAD_DIR, `${base}-low${ext}`);
  const result: ProcessResult = {};

  return new Promise((resolve) => {
    const run = (outPath: string, scale: string, crf: number, sizeKey: 'sizeMedium' | 'sizeLow', urlKey: 'urlMedium' | 'urlLow') => {
      return new Promise<void>((res, rej) => {
        ffmpeg(filePath)
          .outputOptions([
            '-vf', `scale=${scale}:-2`,
            '-c:v', 'libx264',
            '-crf', String(crf),
            '-preset', 'medium',
            '-c:a', 'aac',
            '-b:a', '128k',
          ])
          .output(outPath)
          .on('end', () => {
            try {
              (result as Record<string, unknown>)[urlKey] = '/uploads/' + path.basename(outPath);
              (result as Record<string, unknown>)[sizeKey] = fs.statSync(outPath).size;
            } catch (e) {
              console.error('Stat after ffmpeg:', e);
            }
            res();
          })
          .on('error', (err) => {
            console.error('FFmpeg error:', err.message);
            rej(err);
          })
          .run();
      });
    };

    run(mediumPath, '1280:-2', 28, 'sizeMedium', 'urlMedium')
      .then(() => run(lowPath, '854:-2', 32, 'sizeLow', 'urlLow'))
      .then(() => resolve(result))
      .catch(() => resolve(result));
  });
}

/**
 * Process an uploaded media file: create medium and low variants for images and videos.
 * Returns paths and sizes for the new variants; original file is unchanged.
 */
export async function processMediaFile(filePath: string, mimeType: string): Promise<ProcessResult> {
  if (!fs.existsSync(filePath)) return {};
  if (isImage(mimeType, filePath)) {
    return processImage(filePath, mimeType);
  }
  if (isVideo(mimeType, filePath)) {
    return processVideo(filePath);
  }
  return {};
}
