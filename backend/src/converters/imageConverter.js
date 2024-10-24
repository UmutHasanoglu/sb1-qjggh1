import sharp from 'sharp';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function convertImage(inputPath, format, outputDir) {
  const outputPath = join(outputDir, `${uuidv4()}.${format}`);
  
  await sharp(inputPath)
    .toFormat(format)
    .toFile(outputPath);
  
  return outputPath;
}