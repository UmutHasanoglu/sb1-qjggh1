import sharp from 'sharp';
import { ConversionJob } from '../types';

export class ImageConverter {
  async convert(
    inputPath: string, 
    outputPath: string, 
    outputFormat: string,
    job: ConversionJob
  ): Promise<void> {
    try {
      job.progress = 10;
      const pipeline = sharp(inputPath);
      job.progress = 30;

      // Add optimization based on format
      switch(outputFormat) {
        case 'jpg':
        case 'jpeg':
          pipeline.jpeg({ quality: 85 });
          break;
        case 'png':
          pipeline.png({ compressionLevel: 8 });
          break;
        case 'webp':
          pipeline.webp({ quality: 85 });
          break;
        case 'avif':
          pipeline.avif({ quality: 85 });
          break;
        case 'tiff':
          pipeline.tiff({ compression: 'lzw' });
          break;
      }

      job.progress = 60;
      await pipeline.toFile(outputPath);
      job.progress = 100;
    } catch (error) {
      throw new Error(`Image conversion failed: ${error.message}`);
    }
  }
}
