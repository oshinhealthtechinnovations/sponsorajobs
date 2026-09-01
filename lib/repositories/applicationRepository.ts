/**
 * Application Repository
 * Handles candidate job application tracking, status updates (Applied, Interviewing, Offer, Rejected), and interview notes.
 */

export type ApplicationStatus = "APPLIED" | "INTERVIEWING" | "OFFER" | "REJECTED" | "ARCHIVED";

export interface JobApplication {
  id: string;
  userId: string;
  jobId: string;
  jobTitle: string;
  jobSlug: string;
  companyName: string;
  companyLogo?: string | null;
  location?: string | null;
  salary?: string | null;
  applyUrl: string;
  status: ApplicationStatus;
  notes?: string;
  interviewDate?: string | null;
  appliedAt: string;
  lastUpdatedAt: string;
}

let inMemoryApplications: JobApplication[] = [];

export class ApplicationRepository {
  /**
   * Get all applications tracked by a specific user
   */
  async getByUser(userId: string): Promise<JobApplication[]> {
    return inMemoryApplications
      .filter((app) => app.userId === userId)
      .sort((a, b) => new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime());
  }

  /**
   * Get a specific application by ID
   */
  async getById(id: string, userId: string): Promise<JobApplication | null> {
    const app = inMemoryApplications.find((a) => a.id === id && a.userId === userId);
    return app || null;
  }

  /**
   * Find application for a specific user and job ID
   */
  async getByJobId(jobId: string, userId: string): Promise<JobApplication | null> {
    const app = inMemoryApplications.find((a) => a.jobId === jobId && a.userId === userId);
    return app || null;
  }

  /**
   * Track / Create a new application
   */
  async createApplication(data: {
    userId: string;
    jobId: string;
    jobTitle: string;
    jobSlug?: string;
    companyName: string;
    companyLogo?: string | null;
    location?: string | null;
    salary?: string | null;
    applyUrl: string;
    status?: ApplicationStatus;
    notes?: string;
  }): Promise<JobApplication> {
    const existing = await this.getByJobId(data.jobId, data.userId);
    const now = new Date().toISOString();

    if (existing) {
      existing.status = data.status || existing.status;
      existing.lastUpdatedAt = now;
      if (data.notes) existing.notes = data.notes;
      return existing;
    }

    const newApp: JobApplication = {
      id: `app_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: data.userId,
      jobId: data.jobId,
      jobTitle: data.jobTitle,
      jobSlug: data.jobSlug || data.jobTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      companyName: data.companyName,
      companyLogo: data.companyLogo || null,
      location: data.location || null,
      salary: data.salary || null,
      applyUrl: data.applyUrl,
      status: data.status || "APPLIED",
      notes: data.notes || "",
      interviewDate: null,
      appliedAt: now,
      lastUpdatedAt: now,
    };

    inMemoryApplications.unshift(newApp);
    return newApp;
  }

  /**
   * Update application status (e.g. Applied -> Interviewing -> Offer)
   */
  async updateStatus(
    id: string,
    userId: string,
    status: ApplicationStatus,
    notes?: string
  ): Promise<JobApplication | null> {
    const app = await this.getById(id, userId);
    if (!app) return null;

    app.status = status;
    app.lastUpdatedAt = new Date().toISOString();
    if (notes !== undefined) {
      app.notes = notes;
    }

    return app;
  }

  /**
   * Update interview date / notes
   */
  async updateDetails(
    id: string,
    userId: string,
    updates: {
      notes?: string;
      interviewDate?: string | null;
      salary?: string | null;
    }
  ): Promise<JobApplication | null> {
    const app = await this.getById(id, userId);
    if (!app) return null;

    if (updates.notes !== undefined) app.notes = updates.notes;
    if (updates.interviewDate !== undefined) app.interviewDate = updates.interviewDate;
    if (updates.salary !== undefined) app.salary = updates.salary;
    app.lastUpdatedAt = new Date().toISOString();

    return app;
  }

  /**
   * Delete / untrack an application
   */
  async deleteApplication(id: string, userId: string): Promise<boolean> {
    const index = inMemoryApplications.findIndex((a) => a.id === id && a.userId === userId);
    if (index === -1) return false;
    inMemoryApplications.splice(index, 1);
    return true;
  }

  /**
   * Clear all for tests
   */
  clearAll() {
    inMemoryApplications = [];
  }
}

export const applicationRepository = new ApplicationRepository();
