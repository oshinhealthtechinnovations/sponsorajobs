/**
 * Application Repository
 * Handles candidate job application tracking, status updates (Applied, Interviewing, Offer, Rejected),
 * interview notes, in-memory caching, and persistent Supabase Cloud Postgres synchronization.
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
  private getSupabaseConfig() {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return { supabaseUrl, supabaseKey };
  }

  /**
   * Helper to sync application record to Supabase
   */
  private async syncToSupabase(app: JobApplication): Promise<boolean> {
    const { supabaseUrl, supabaseKey } = this.getSupabaseConfig();
    if (!supabaseUrl || !supabaseKey) return false;

    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/candidate_applications`, {
        method: "POST",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates,return=minimal",
        },
        body: JSON.stringify({
          id: app.id,
          user_id: app.userId,
          job_id: app.jobId,
          job_title: app.jobTitle,
          job_slug: app.jobSlug,
          company_name: app.companyName,
          company_logo: app.companyLogo,
          location: app.location,
          salary: app.salary,
          apply_url: app.applyUrl,
          status: app.status,
          notes: app.notes || "",
          interview_date: app.interviewDate || null,
          applied_at: app.appliedAt,
          last_updated_at: app.lastUpdatedAt,
        }),
      });

      return res.ok || res.status === 201;
    } catch {
      return false;
    }
  }

  /**
   * Helper to fetch applications from Supabase for a user
   */
  private async fetchFromSupabase(userId: string): Promise<JobApplication[]> {
    const { supabaseUrl, supabaseKey } = this.getSupabaseConfig();
    if (!supabaseUrl || !supabaseKey) return [];

    try {
      const cleanUserId = encodeURIComponent(userId);
      const res = await fetch(
        `${supabaseUrl}/rest/v1/candidate_applications?user_id=eq.${cleanUserId}&order=last_updated_at.desc`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        }
      );

      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows)) {
          return rows.map((r: any) => ({
            id: r.id,
            userId: r.user_id,
            jobId: r.job_id,
            jobTitle: r.job_title,
            jobSlug: r.job_slug || "",
            companyName: r.company_name,
            companyLogo: r.company_logo || null,
            location: r.location || null,
            salary: r.salary || null,
            applyUrl: r.apply_url || "",
            status: (r.status as ApplicationStatus) || "APPLIED",
            notes: r.notes || "",
            interviewDate: r.interview_date || null,
            appliedAt: r.applied_at || new Date().toISOString(),
            lastUpdatedAt: r.last_updated_at || new Date().toISOString(),
          }));
        }
      }
    } catch {}

    return [];
  }

  /**
   * Get all applications tracked by a specific user (merges Supabase + in-memory cache)
   */
  async getByUser(userId: string): Promise<JobApplication[]> {
    const remote = await this.fetchFromSupabase(userId);
    const local = inMemoryApplications.filter((app) => app.userId === userId);

    const map = new Map<string, JobApplication>();
    for (const app of remote) map.set(app.jobId || app.id, app);
    for (const app of local) map.set(app.jobId || app.id, app);

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime()
    );
  }

  /**
   * Get a specific application by ID
   */
  async getById(id: string, userId: string): Promise<JobApplication | null> {
    const list = await this.getByUser(userId);
    return list.find((a) => a.id === id || a.jobId === id) || null;
  }

  /**
   * Find application for a specific user and job ID
   */
  async getByJobId(jobId: string, userId: string): Promise<JobApplication | null> {
    const list = await this.getByUser(userId);
    return list.find((a) => a.jobId === jobId) || null;
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
      this.syncToSupabase(existing).catch(() => {});
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
    this.syncToSupabase(newApp).catch(() => {});
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

    this.syncToSupabase(app).catch(() => {});
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

    this.syncToSupabase(app).catch(() => {});
    return app;
  }

  /**
   * Delete / untrack an application
   */
  async deleteApplication(id: string, userId: string): Promise<boolean> {
    const index = inMemoryApplications.findIndex(
      (a) => (a.id === id || a.jobId === id) && a.userId === userId
    );
    if (index !== -1) {
      inMemoryApplications.splice(index, 1);
    }

    const { supabaseUrl, supabaseKey } = this.getSupabaseConfig();
    if (supabaseUrl && supabaseKey) {
      try {
        const cleanId = encodeURIComponent(id);
        await fetch(
          `${supabaseUrl}/rest/v1/candidate_applications?id=eq.${cleanId}&user_id=eq.${encodeURIComponent(userId)}`,
          {
            method: "DELETE",
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
            },
          }
        );
      } catch {}
    }

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
