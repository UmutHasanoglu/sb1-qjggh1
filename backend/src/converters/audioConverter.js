import ffmpeg from 'fluent-ffmpeg';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export function convertAudio(inputPath, format, outputDir) {
  return new Promise((resolve, reject) => {
    const outputPath = join(outputDir, `${uuidv4()}.${format}`);
    
    ffmpeg(inputPath)
      .toFormat(format)
      .on('end', () => resolve(outputPath))
      .on('error', reject)
      .save(outputPath);
  });
}