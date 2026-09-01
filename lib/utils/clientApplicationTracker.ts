import { JobApplication, ApplicationStatus } from "@/lib/repositories/applicationRepository";

export function getLocalApplications(userId?: string): JobApplication[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("sa_user_applications");
    if (!raw) return [];
    const list: JobApplication[] = JSON.parse(raw);
    if (userId) {
      return list.filter((a) => !a.userId || a.userId === userId);
    }
    return list;
  } catch {
    return [];
  }
}

export function saveLocalApplication(
  app: Partial<JobApplication> & {
    jobId: string;
    jobTitle: string;
    companyName: string;
    applyUrl: string;
  },
  userId?: string
): JobApplication {
  const now = new Date().toISOString();

  const newApp: JobApplication = {
    id: app.id || `app_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId: userId || app.userId || "",
    jobId: app.jobId,
    jobTitle: app.jobTitle,
    jobSlug: app.jobSlug || app.jobTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    companyName: app.companyName,
    companyLogo: app.companyLogo || null,
    location: app.location || null,
    salary: app.salary || null,
    applyUrl: app.applyUrl,
    status: (app.status as ApplicationStatus) || "APPLIED",
    notes: app.notes || "",
    interviewDate: app.interviewDate || null,
    appliedAt: app.appliedAt || now,
    lastUpdatedAt: now,
  };

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("sa_user_applications");
      const list: JobApplication[] = raw ? JSON.parse(raw) : [];

      const existingIdx = list.findIndex(
        (a) => a.jobId === app.jobId && (!userId || !a.userId || a.userId === userId)
      );

      if (existingIdx >= 0) {
        list[existingIdx] = {
          ...list[existingIdx],
          ...app,
          status: (app.status as ApplicationStatus) || list[existingIdx].status || "APPLIED",
          lastUpdatedAt: now,
        };
      } else {
        list.unshift(newApp);
      }

      localStorage.setItem("sa_user_applications", JSON.stringify(list));
      window.dispatchEvent(new Event("user-session-changed"));
    } catch {}
  }

  return newApp;
}

export function updateLocalApplicationStatus(
  appId: string,
  status: ApplicationStatus,
  notes?: string
): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem("sa_user_applications");
    if (!raw) return;
    const list: JobApplication[] = JSON.parse(raw);
    const updated = list.map((a) =>
      a.id === appId || a.jobId === appId
        ? { ...a, status, notes: notes !== undefined ? notes : a.notes, lastUpdatedAt: new Date().toISOString() }
        : a
    );
    localStorage.setItem("sa_user_applications", JSON.stringify(updated));
    window.dispatchEvent(new Event("user-session-changed"));
  } catch {}
}

export function deleteLocalApplication(appId: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem("sa_user_applications");
    if (!raw) return;
    const list: JobApplication[] = JSON.parse(raw);
    const updated = list.filter((a) => a.id !== appId && a.jobId !== appId);
    localStorage.setItem("sa_user_applications", JSON.stringify(updated));
    window.dispatchEvent(new Event("user-session-changed"));
  } catch {}
}
