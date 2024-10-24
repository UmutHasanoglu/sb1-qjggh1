import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.fileforge.com';

export interface ConversionRequest {
  file: File;
  targetFormat: string;
}

export interface ConversionResponse {
  jobId: string;
  status: string;
  downloadUrl?: string;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export const conversionService = {
  async startConversion(data: ConversionRequest): Promise<ConversionResponse> {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('targetFormat', data.targetFormat);

    try {
      const response = await api.post('/conversions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Conversion failed');
      }
      throw error;
    }
  },

  async getJobStatus(jobId: string): Promise<ConversionResponse> {
    try {
      const response = await api.get(`/conversions/${jobId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to get job status');
      }
      throw error;
    }
  },
};