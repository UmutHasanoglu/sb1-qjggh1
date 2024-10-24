import express from 'express';
import multer from 'multer';
import path from 'path';
import { ImageConverter } from '../converters/imageConverter';
import { DocumentConverter } from '../converters/documentConverter';
import { SpreadsheetConverter } from '../converters/spreadsheetConverter';
import { ConversionJob } from '../types';
import { UserLimiter } from '../services/userLimiter';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const imageConverter = new ImageConverter();
const documentConverter = new DocumentConverter();
const spreadsheetConverter = new SpreadsheetConverter();
const userLimiter = UserLimiter.getInstance();

// Store active jobs in memory (consider using Redis in production)
const activeJobs = new Map<string, ConversionJob>();

// Add authentication middleware
const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Authentication required' });
};

// Add endpoint to check remaining conversions
router.get('/remaining-conversions', requireAuth, (req, res) => {
  const userId = (req.user as any).id;
  const remaining = userLimiter.getRemainingConversions(userId);
  res.json({ remainingConversions: remaining });
});

router.post('/convert', requireAuth, upload.single('file'), async (req, res) => {
  try {
    // Use actual user ID instead of header
    const userId = (req.user as any).id;

    // Check conversion limit
    if (!userLimiter.checkLimit(userId)) {
      return res.status(403).json({ 
        error: 'Free conversion limit reached',
        remainingConversions: 0,
        upgradeMessage: 'Please upgrade to premium for unlimited conversions'
      });
    }

    const { outputFormat } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const inputFormat = path.extname(file.originalname).slice(1).toLowerCase();
    const outputPath = `uploads/${file.filename}.${outputFormat}`;

    const job: ConversionJob = {
      id: file.filename,
      inputFormat,
      outputFormat,
      status: 'processing',
      progress: 0,
      inputFile: file.path,
    };

    activeJobs.set(job.id, job);

    // Increment conversion count before processing
    userLimiter.incrementCount(userId);

    // Return job ID and remaining conversions
    res.json({ 
      jobId: job.id,
      remainingConversions: userLimiter.getRemainingConversions(userId)
    });

    // Process conversion asynchronously
    try {
      if (['png', 'jpg', 'jpeg', 'webp', 'avif', 'tiff'].includes(inputFormat)) {
        await imageConverter.convert(file.path, outputPath, outputFormat, job);
      } else if (['pdf', 'docx', 'txt', 'md', 'rtf'].includes(inputFormat)) {
        await documentConverter.convert(file.path, outputPath, inputFormat, outputFormat, job);
      } else if (['xlsx', 'csv', 'xls', 'ods'].includes(inputFormat)) {
        await spreadsheetConverter.convert(file.path, outputPath, inputFormat, outputFormat, job);
      } else {
        throw new Error('Unsupported file format');
      }

      job.status = 'completed';
      job.outputFile = outputPath;
    } catch (error) {
      job.status = 'failed';
      job.error = error.message;
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Existing status endpoint
router.get('/status/:jobId', (req, res) => {
  const job = activeJobs.get(req.params.jobId);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  res.json(job);
});

// Add this endpoint to handle file downloads
router.get('/download/:jobId', (req, res) => {
  const job = activeJobs.get(req.params.jobId);
  if (!job || !job.outputFile) {
    return res.status(404).json({ error: 'File not found' });
  }

  res.download(job.outputFile);
});

export default router;
