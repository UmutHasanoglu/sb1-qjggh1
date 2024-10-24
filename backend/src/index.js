import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdir } from 'fs/promises';
import { convertImage } from './converters/imageConverter.js';
import { convertAudio } from './converters/audioConverter.js';
import { convertVideo } from './converters/videoConverter.js';
import { convertDocument } from './converters/documentConverter.js';
import { jobManager } from './jobManager.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const uploadsDir = join(__dirname, '../uploads');
const outputDir = join(__dirname, '../output');

// Ensure directories exist
await mkdir(uploadsDir, { recursive: true });
await mkdir(outputDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });
const app = express();

app.use(cors());
app.use(express.json());
app.use('/output', express.static(outputDir));

app.post('/conversions', upload.single('file'), async (req, res) => {
  try {
    const { file } = req;
    const { targetFormat } = req.body;
    
    const jobId = jobManager.createJob();
    
    // Start conversion in background
    convertFile(file.path, targetFormat, jobId).catch(error => {
      jobManager.updateJob(jobId, { status: 'failed', error: error.message });
    });
    
    res.json({ jobId, status: 'pending' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/conversions/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = jobManager.getJob(jobId);
  
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  
  res.json(job);
});

async function convertFile(filePath, targetFormat, jobId) {
  const format = targetFormat.toLowerCase();
  let converter;
  
  if (['png', 'jpeg', 'webp', 'gif'].includes(format)) {
    converter = convertImage;
  } else if (['mp3', 'wav', 'ogg', 'm4a'].includes(format)) {
    converter = convertAudio;
  } else if (['mp4', 'webm', 'mov', 'avi'].includes(format)) {
    converter = convertVideo;
  } else if (['pdf', 'docx', 'txt', 'xlsx'].includes(format)) {
    converter = convertDocument;
  } else {
    throw new Error('Unsupported format');
  }
  
  jobManager.updateJob(jobId, { status: 'processing' });
  
  const outputPath = await converter(filePath, format, outputDir);
  const downloadUrl = `/output/${outputPath.split('/').pop()}`;
  
  jobManager.updateJob(jobId, {
    status: 'completed',
    downloadUrl,
    progress: 100
  });
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});