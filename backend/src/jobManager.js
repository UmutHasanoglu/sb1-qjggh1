import { v4 as uuidv4 } from 'uuid';

class JobManager {
  constructor() {
    this.jobs = new Map();
  }

  createJob() {
    const jobId = uuidv4();
    this.jobs.set(jobId, {
      id: jobId,
      status: 'pending',
      progress: 0,
      createdAt: new Date()
    });
    return jobId;
  }

  getJob(jobId) {
    return this.jobs.get(jobId);
  }

  updateJob(jobId, updates) {
    const job = this.jobs.get(jobId);
    if (job) {
      this.jobs.set(jobId, { ...job, ...updates });
    }
  }
}

export const jobManager = new JobManager();