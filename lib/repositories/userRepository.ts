/**
 * User & Free Trial Request Repository
 * Handles user authentication, referral code validation (sumit_raj_linkedin), and trial requests.
 */

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  profession: string;
  promoCodeUsed: string;
  isTrial: boolean;
  isActive: boolean;
  isEmailVerified: boolean;
  verificationCode?: string;
  verificationCodeExpires?: string;
  createdAt: string;
  lastLoginAt: string;
}

export interface TrialAccessRequest {
  id: string;
  name: string;
  email: string;
  profession: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

// In-memory store initialized with demo admin/test accounts for persistence across edge requests
let inMemoryUsers: UserAccount[] = [];
let inMemoryTrialRequests: TrialAccessRequest[] = [];

export const VALID_PROMO_CODES = ["sumit_raj_linkedin"];

/**
 * Hash a password using SHA-256 via SubtleCrypto (edge-runtime compatible, zero dependencies).
 * For production use, consider PBKDF2 with a salt for stronger security.
 */
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export class UserRepository {
  /**
   * Validate if the provided promo/referral code is valid
   */
  isValidPromoCode(code: string): boolean {
    if (!code) return false;
    const clean = code.trim().toLowerCase();
    const envCodes = (process.env.PROMO_CODES || "")
      .split(",")
      .map((c) => c.trim().toLowerCase())
      .filter(Boolean);
    const validList = [...VALID_PROMO_CODES, ...envCodes];
    return validList.includes(clean);
  }

  /**
   * Find a user by email
   */
  async findByEmail(email: string): Promise<UserAccount | null> {
    const cleanEmail = email.trim().toLowerCase();
    const user = inMemoryUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    return user || null;
  }

  /**
   * Register a new user with verified promo code
   */
  async createUser(data: {
    name: string;
    email: string;
    password: string;
    profession: string;
    promoCode: string;
  }): Promise<UserAccount> {
    const cleanEmail = data.email.trim().toLowerCase();
    const existing = await this.findByEmail(cleanEmail);
    if (existing) {
      throw new Error("An account with this email address already exists.");
    }

    // ✅ CRIT-003 Fix: Hash password before storing
    const hashedPassword = await hashPassword(data.password);

    const newUser: UserAccount = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: data.name.trim(),
      email: cleanEmail,
      passwordHash: hashedPassword,
      profession: data.profession.trim(),
      promoCodeUsed: data.promoCode.trim().toLowerCase(),
      isTrial: false,
      isActive: true,
      isEmailVerified: false,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    inMemoryUsers.unshift(newUser);
    return newUser;
  }

  /**
   * Find a user by ID
   */
  async findById(id: string): Promise<UserAccount | null> {
    const user = inMemoryUsers.find((u) => u.id === id);
    return user || null;
  }

  /**
   * Generate a 6-digit OTP verification code for a user
   */
  async generateVerificationCode(email: string): Promise<string> {
    const cleanEmail = email.trim().toLowerCase();
    const user = await this.findByEmail(cleanEmail);
    if (!user) {
      throw new Error("User account not found.");
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = code;
    // Valid for 15 minutes
    user.verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    return code;
  }

  /**
   * Verify email using 6-digit OTP code
   */
  async verifyEmailCode(email: string, code: string): Promise<boolean> {
    const cleanEmail = email.trim().toLowerCase();
    const user = await this.findByEmail(cleanEmail);
    if (!user) return false;

    if (!user.verificationCode || user.verificationCode !== code.trim()) {
      return false;
    }

    if (user.verificationCodeExpires && new Date(user.verificationCodeExpires) < new Date()) {
      return false; // expired
    }

    user.isEmailVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    return true;
  }

  /**
   * Manually mark user email verified
   */
  async markVerified(email: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    if (!user) return false;
    user.isEmailVerified = true;
    return true;
  }

  /**
   * Authenticate user with email and password
   */
  async authenticate(email: string, password: string): Promise<UserAccount | null> {
    const cleanEmail = email.trim().toLowerCase();
    const user = inMemoryUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) return null;
    const hashedInput = await hashPassword(password);
    if (user.passwordHash !== hashedInput) return null;

    user.lastLoginAt = new Date().toISOString();
    return user;
  }

  /**
   * Record a Free Trial Request
   */
  async createTrialRequest(data: {
    name: string;
    email: string;
    profession: string;
  }): Promise<TrialAccessRequest> {
    const cleanEmail = data.email.trim().toLowerCase();
    const request: TrialAccessRequest = {
      id: `trial_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: data.name.trim(),
      email: cleanEmail,
      profession: data.profession.trim(),
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    inMemoryTrialRequests.unshift(request);
    return request;
  }

  /**
   * Get all trial requests for admin review
   */
  async getAllTrialRequests(): Promise<TrialAccessRequest[]> {
    return inMemoryTrialRequests;
  }

  /**
   * Get all registered users for admin telemetry
   */
  async getAllUsers(): Promise<UserAccount[]> {
    return inMemoryUsers;
  }
}

export const userRepository = new UserRepository();
