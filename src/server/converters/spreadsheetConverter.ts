import xlsx from 'xlsx';
import fs from 'fs/promises';
import { ConversionJob } from '../types';

export class SpreadsheetConverter {
  async convert(
    inputPath: string,
    outputPath: string,
    inputFormat: string,
    outputFormat: string,
    job: ConversionJob
  ): Promise<void> {
    try {
      job.progress = 10;
      const workbook = xlsx.readFile(inputPath);
      job.progress = 50;

      if (outputFormat === 'csv') {
        // Get the first sheet
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const csvContent = xlsx.utils.sheet_to_csv(firstSheet);
        await fs.writeFile(outputPath, csvContent, 'utf-8');
      } else {
        xlsx.writeFile(workbook, outputPath);
      }
      
      job.progress = 100;
    } catch (error) {
      throw new Error(`Spreadsheet conversion failed: ${error.message}`);
    }
  }
}
