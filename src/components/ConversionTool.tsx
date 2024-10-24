import React, { useState, useEffect } from 'react';
import { Upload, FileType, ArrowRight, Download, Trash2, AlertCircle } from 'lucide-react';
import { useConversionStore, ConversionJob } from '../store/conversionStore';
import { conversionService } from '../services/api';

type FileFormat = 'image' | 'audio' | 'video' | 'document';

const formatOptions = {
  image: ['PNG', 'JPEG', 'WEBP', 'GIF'],
  audio: ['MP3', 'WAV', 'OGG', 'M4A'],
  video: ['MP4', 'WEBM', 'MOV', 'AVI'],
  document: ['PDF', 'DOCX', 'TXT', 'XLSX']
};

export default function ConversionTool() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  const [fileType, setFileType] = useState<FileFormat>('image');
  const [error, setError] = useState<string>('');
  
  const { jobs, addJob, updateJob, removeJob } = useConversionStore();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError('');
    }
  };

  const handleConvert = async () => {
    if (!selectedFile || !selectedFormat) return;

    try {
      const jobId = crypto.randomUUID();
      
      // Add initial job to store
      addJob({
        id: jobId,
        fileName: selectedFile.name,
        sourceFormat: selectedFile.name.split('.').pop()?.toUpperCase() || '',
        targetFormat: selectedFormat,
        status: 'pending',
        progress: 0,
      });

      // Start conversion
      const response = await conversionService.startConversion({
        file: selectedFile,
        targetFormat: selectedFormat,
      });

      // Update job with server response
      updateJob(jobId, {
        status: 'processing',
        progress: 0,
      });

      // Poll for status
      const pollInterval = setInterval(async () => {
        try {
          const status = await conversionService.getJobStatus(response.jobId);
          
          if (status.status === 'completed') {
            updateJob(jobId, {
              status: 'completed',
              progress: 100,
              downloadUrl: status.downloadUrl,
            });
            clearInterval(pollInterval);
          } else if (status.status === 'failed') {
            updateJob(jobId, {
              status: 'failed',
              error: 'Conversion failed',
            });
            clearInterval(pollInterval);
          }
        } catch (error) {
          clearInterval(pollInterval);
          updateJob(jobId, {
            status: 'failed',
            error: 'Failed to get conversion status',
          });
        }
      }, 2000);

      // Reset form
      setSelectedFile(null);
      setSelectedFormat('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Conversion failed');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">File Converter</h1>
          <p className="text-gray-600">Convert your files to any format instantly</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {(['image', 'audio', 'video', 'document'] as FileFormat[]).map((type) => (
            <button
              key={type}
              onClick={() => setFileType(type)}
              className={`p-4 rounded-xl transition-all ${
                fileType === type
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <FileType className="w-6 h-6 mx-auto mb-2" />
              <span className="block capitalize">{type}</span>
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            selectedFile ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-blue-500'
          }`}>
            <input
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              id="fileInput"
            />
            <label htmlFor="fileInput" className="cursor-pointer">
              {selectedFile ? (
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-green-600">{selectedFile.name}</span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedFile(null);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="w-12 h-12 mx-auto text-gray-400" />
                  <div className="text-gray-600">
                    <span className="text-blue-500 hover:text-blue-600">Upload a file</span>
                    {' '}or drag and drop
                  </div>
                </div>
              )}
            </label>
          </div>

          {selectedFile && (
            <div className="flex items-center justify-center space-x-4">
              <div className="flex-1">
                <select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select output format</option>
                  {formatOptions[fileType].map((format) => (
                    <option key={format} value={format}>{format}</option>
                  ))}
                </select>
              </div>
              <ArrowRight className="w-6 h-6 text-gray-400" />
              <button
                onClick={handleConvert}
                disabled={!selectedFormat || jobs.some(j => j.status === 'processing')}
                className={`px-6 py-3 rounded-lg flex items-center space-x-2 ${
                  !selectedFormat || jobs.some(j => j.status === 'processing')
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                <Download className="w-5 h-5" />
                <span>Convert Now</span>
              </button>
            </div>
          )}
        </div>

        {jobs.length > 0 && (
          <div className="mt-8 space-y-4">
            <h2 className="text-lg font-semibold">Recent Conversions</h2>
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-gray-50 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex-1">
                  <p className="font-medium">{job.fileName}</p>
                  <p className="text-sm text-gray-600">
                    {job.sourceFormat} → {job.targetFormat}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  {job.status === 'processing' && (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                      <span className="ml-2 text-sm text-gray-600">Converting...</span>
                    </div>
                  )}
                  {job.status === 'completed' && job.downloadUrl && (
                    <a
                      href={job.downloadUrl}
                      download
                      className="text-blue-500 hover:text-blue-600 flex items-center space-x-1"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </a>
                  )}
                  {job.status === 'failed' && (
                    <span className="text-red-500 text-sm">{job.error}</span>
                  )}
                  <button
                    onClick={() => removeJob(job.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 pt-8 border-t border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Supported Formats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(formatOptions).map(([category, formats]) => (
              <div key={category} className="space-y-2">
                <h3 className="font-medium capitalize">{category}</h3>
                <div className="text-sm text-gray-600">
                  {formats.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}