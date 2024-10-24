import { PDFDocument, rgb } from 'pdf-lib';
import { Document, Packer, Paragraph } from 'docx';
import fs from 'fs/promises';
import { ConversionJob } from '../types';

export class DocumentConverter {
  async convert(
    inputPath: string,
    outputPath: string,
    inputFormat: string,
    outputFormat: string,
    job: ConversionJob
  ): Promise<void> {
    if (inputFormat === 'docx' && outputFormat === 'pdf') {
      await this.docxToPdf(inputPath, outputPath, job);
    } else if (inputFormat === 'txt' && outputFormat === 'pdf') {
      await this.txtToPdf(inputPath, outputPath, job);
    } else if (inputFormat === 'md' && outputFormat === 'pdf') {
      await this.mdToPdf(inputPath, outputPath, job);
    } else if (inputFormat === 'txt' && outputFormat === 'docx') {
      await this.txtToDocx(inputPath, outputPath, job);
    } else {
      throw new Error('Unsupported conversion format');
    }
  }

  private async docxToPdf(inputPath: string, outputPath: string, job: ConversionJob): Promise<void> {
    // Implementation for DOCX to PDF conversion
    // This is a placeholder - you'll need to implement the actual conversion logic
  }

  private async txtToPdf(inputPath: string, outputPath: string, job: ConversionJob): Promise<void> {
    job.progress = 10;
    const text = await fs.readFile(inputPath, 'utf-8');
    job.progress = 30;
    
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    job.progress = 50;

    // Improved text formatting
    const lines = text.split('\n');
    let yPosition = page.getHeight() - 50;
    
    for (const line of lines) {
      page.drawText(line, {
        x: 50,
        y: yPosition,
        size: 12,
        color: rgb(0, 0, 0),
      });
      yPosition -= 15;
      
      if (yPosition < 50) {
        yPosition = page.getHeight() - 50;
        page.addPage();
      }
    }

    job.progress = 80;
    const pdfBytes = await pdfDoc.save();
    await fs.writeFile(outputPath, pdfBytes);
    job.progress = 100;
  }

  private async txtToDocx(inputPath: string, outputPath: string, job: ConversionJob): Promise<void> {
    job.progress = 10;
    const text = await fs.readFile(inputPath, 'utf-8');
    job.progress = 30;

    const doc = new Document({
      sections: [{
        properties: {},
        children: text.split('\n').map(line => 
          new Paragraph({ text: line })
        ),
      }],
    });

    job.progress = 70;
    const buffer = await Packer.toBuffer(doc);
    await fs.writeFile(outputPath, buffer);
    job.progress = 100;
  }

  private async mdToPdf(inputPath: string, outputPath: string, job: ConversionJob): Promise<void> {
    // Similar to txtToPdf but with basic markdown parsing
    job.progress = 10;
    const text = await fs.readFile(inputPath, 'utf-8');
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    job.progress = 30;

    // Basic markdown parsing
    const lines = text.split('\n');
    let yPosition = page.getHeight() - 50;

    for (const line of lines) {
      let fontSize = 12;
      let text = line;

      if (line.startsWith('# ')) {
        fontSize = 24;
        text = line.substring(2);
      } else if (line.startsWith('## ')) {
        fontSize = 20;
        text = line.substring(3);
      }

      page.drawText(text, {
        x: 50,
        y: yPosition,
        size: fontSize,
        color: rgb(0, 0, 0),
      });

      yPosition -= fontSize + 5;
      job.progress = 30 + (70 * (page.getHeight() - yPosition) / page.getHeight());
    }

    const pdfBytes = await pdfDoc.save();
    await fs.writeFile(outputPath, pdfBytes);
    job.progress = 100;
  }
}
