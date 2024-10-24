import { convertAsync } from 'libreoffice-convert';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function convertDocument(inputPath, format, outputDir) {
  const inputBuffer = await readFile(inputPath);
  const outputPath = join(outputDir, `${uuidv4()}.${format}`);
  
  const outputBuffer = await convertAsync(inputBuffer, format, undefined);
  await writeFile(outputPath, outputBuffer);
  
  return outputPath;
}