import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';

const ConversionTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState<string>('pdf');
  const [status, setStatus] = useState<string>('');
  const { user } = useAuthStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) return;

    try {
      setStatus('Uploading...');
      
      // Upload file to Supabase Storage
      const filename = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('conversions')
        .upload(`inputs/${user.id}/${filename}`, file);

      if (uploadError) throw uploadError;

      // Create conversion job
      const { data: job, error: jobError } = await supabase
        .from('conversion_jobs')
        .insert({
          user_id: user.id,
          input_format: file.name.split('.').pop()?.toLowerCase(),
          output_format: outputFormat,
          status: 'pending',
          input_file: uploadData.path
        })
        .select()
        .single();

      if (jobError) throw jobError;

      setStatus('Processing...');
      
      // Poll for job completion
      const interval = setInterval(async () => {
        const { data: updatedJob } = await supabase
          .from('conversion_jobs')
          .select()
          .eq('id', job.id)
          .single();

        if (updatedJob.status === 'completed') {
          clearInterval(interval);
          setStatus('Conversion complete!');
          
          // Download the converted file
          const { data: fileData } = await supabase.storage
            .from('conversions')
            .download(`outputs/${user.id}/${updatedJob.output_file}`);

          if (fileData) {
            const url = URL.createObjectURL(fileData);
            const a = document.createElement('a');
            a.href = url;
            a.download = updatedJob.output_file;
            a.click();
            URL.revokeObjectURL(url);
          }
        } else if (updatedJob.status === 'failed') {
          clearInterval(interval);
          setStatus(`Conversion failed: ${updatedJob.error}`);
        }
      }, 1000);
    } catch (error) {
      setStatus('Error: ' + (error as Error).message);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Select File
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            className="mt-1 block w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Output Format
          </label>
          <select
            value={outputFormat}
            onChange={(e) => setOutputFormat(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="pdf">PDF</option>
            <option value="docx">DOCX</option>
            <option value="png">PNG</option>
            <option value="jpg">JPG</option>
            <option value="webp">WebP</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={!file}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
        >
          Convert
        </button>

        {status && (
          <div className="mt-4 text-center text-sm text-gray-600">
            {status}
          </div>
        )}
      </form>
    </div>
  );
};

export default ConversionTool;
