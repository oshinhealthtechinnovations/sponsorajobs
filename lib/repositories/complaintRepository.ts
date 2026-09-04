import fs from "fs";
import path from "path";

export type ComplaintCategory =
  | "UNLOCK_ISSUE"
  | "CV_SCORING"
  | "APP_TRACKER"
  | "PAYMENT"
  | "BUG_FEEDBACK"
  | "OTHER";

export type ComplaintStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";
export type ComplaintPriority = "NORMAL" | "URGENT";

export interface CandidateComplaint {
  id: string;
  ticketId: string;
  userId?: string;
  userEmail: string;
  userName?: string;
  userPhone?: string;
  planLabel?: string;
  category: ComplaintCategory;
  subject: string;
  message: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  adminNotes?: string;
  createdAt: string;
  resolvedAt?: string | null;
}

let inMemoryComplaints: CandidateComplaint[] = [];

export class ComplaintRepository {
  private getStorageFilePath(): string {
    const dataDir = path.join(process.cwd(), "lib", "data");
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch {}
    }
    return path.join(dataDir, "complaints.json");
  }

  private loadFromFile(): void {
    try {
      const filePath = this.getStorageFilePath();
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf-8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          inMemoryComplaints = parsed;
        }
      }
    } catch {
      // In serverless / read-only filesystem, use in-memory store
    }
  }

  private saveToFile(): void {
    try {
      const filePath = this.getStorageFilePath();
      fs.writeFileSync(filePath, JSON.stringify(inMemoryComplaints, null, 2), "utf-8");
    } catch {
      // Graceful fallback in read-only environment
    }
  }

  /**
   * Helper to sync to Supabase if table exists
   */
  private async syncToSupabase(complaint: CandidateComplaint): Promise<boolean> {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) return false;

    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/candidate_complaints`, {
        method: "POST",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates,return=minimal",
        },
        body: JSON.stringify(complaint),
      });
      return res.ok || res.status === 201;
    } catch {
      return false;
    }
  }

  /**
   * Create a new complaint / support ticket
   */
  async createComplaint(data: {
    userId?: string;
    userEmail: string;
    userName?: string;
    userPhone?: string;
    planLabel?: string;
    category: ComplaintCategory;
    subject: string;
    message: string;
    priority?: ComplaintPriority;
  }): Promise<CandidateComplaint> {
    this.loadFromFile();

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const ticketId = `VIP-TCK-${randomSuffix}`;
    const id = `cmp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const complaint: CandidateComplaint = {
      id,
      ticketId,
      userId: data.userId || "",
      userEmail: data.userEmail.trim().toLowerCase(),
      userName: data.userName || "VIP Candidate",
      userPhone: data.userPhone || "",
      planLabel: data.planLabel || "Candidate Pro",
      category: data.category || "OTHER",
      subject: data.subject.trim(),
      message: data.message.trim(),
      priority: data.priority || "NORMAL",
      status: "OPEN",
      createdAt: new Date().toISOString(),
      resolvedAt: null,
    };

    inMemoryComplaints.unshift(complaint);
    this.saveToFile();

    // Async sync to Supabase without blocking
    this.syncToSupabase(complaint).catch(() => {});

    return complaint;
  }

  /**
   * Fetch all complaints (for Admin)
   */
  async getAllComplaints(): Promise<CandidateComplaint[]> {
    this.loadFromFile();
    return [...inMemoryComplaints];
  }

  /**
   * Fetch complaints for a specific user
   */
  async getComplaintsForUser(email: string): Promise<CandidateComplaint[]> {
    this.loadFromFile();
    const cleanEmail = email.trim().toLowerCase();
    return inMemoryComplaints.filter((c) => c.userEmail === cleanEmail);
  }

  /**
   * Update complaint status or admin notes
   */
  async updateStatus(
    idOrTicketId: string,
    status: ComplaintStatus,
    adminNotes?: string
  ): Promise<CandidateComplaint | null> {
    this.loadFromFile();

    const item = inMemoryComplaints.find(
      (c) => c.id === idOrTicketId || c.ticketId === idOrTicketId
    );

    if (!item) return null;

    item.status = status;
    if (adminNotes !== undefined) {
      item.adminNotes = adminNotes;
    }
    if (status === "RESOLVED") {
      item.resolvedAt = new Date().toISOString();
    } else {
      item.resolvedAt = null;
    }

    this.saveToFile();
    this.syncToSupabase(item).catch(() => {});

    return item;
  }
}

export const complaintRepository = new ComplaintRepository();
