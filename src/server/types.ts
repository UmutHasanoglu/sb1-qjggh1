export interface ConversionJob {
  id: string;
  inputFormat: string;
  outputFormat: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  inputFile: string;
  outputFile?: string;
  error?: string;
}

export type SupportedImageFormats = 'png' | 'jpg' | 'webp' | 'avif' | 'gif' | 'tiff';
export type SupportedDocumentFormats = 'pdf' | 'docx' | 'txt' | 'md' | 'rtf';
export type SupportedSpreadsheetFormats = 'xlsx' | 'csv' | 'xls' | 'ods';
