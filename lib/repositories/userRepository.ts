/**
 * User & Free Trial Request Repository
 * Handles user authentication, referral code validation (sumit_raj_linkedin), email OTP verification, and trial requests.
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

export interface PendingRegistration {
  name: string;
  email: string;
  passwordHash: string;
  profession: string;
  promoCode: string;
  otpCode: string;
  expiresAt: string;
}

export interface TrialAccessRequest {
  id: string;
  name: string;
  email: string;
  profession: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

// In-memory stores
let inMemoryUsers: UserAccount[] = [];
let inMemoryPendingRegistrations: Map<string, PendingRegistration> = new Map();
let inMemoryTrialRequests: TrialAccessRequest[] = [];

export const VALID_PROMO_CODES = ["sumit_raj_linkedin"];

/**
 * Hash a password using SHA-256 via SubtleCrypto (edge-runtime compatible, zero dependencies).
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
   * Stage a pending registration and generate a 6-digit OTP code
   */
  async createPendingRegistration(data: {
    name: string;
    email: string;
    password: string;
    profession: string;
    promoCode?: string;
  }): Promise<{ otpCode: string; email: string }> {
    const cleanEmail = data.email.trim().toLowerCase();
    const existing = await this.findByEmail(cleanEmail);
    if (existing) {
      throw new Error("An account with this email address already exists. Please sign in.");
    }

    const hashedPassword = await hashPassword(data.password);
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    inMemoryPendingRegistrations.set(cleanEmail, {
      name: data.name.trim(),
      email: cleanEmail,
      passwordHash: hashedPassword,
      profession: data.profession.trim(),
      promoCode: data.promoCode ? data.promoCode.trim().toLowerCase() : "",
      otpCode,
      expiresAt,
    });

    return { otpCode, email: cleanEmail };
  }

  /**
   * Resend a fresh 6-digit OTP code for a pending registration
   */
  async resendRegistrationOtp(email: string): Promise<string> {
    const cleanEmail = email.trim().toLowerCase();
    const pending = inMemoryPendingRegistrations.get(cleanEmail);
    if (!pending) {
      throw new Error("No pending registration found for this email. Please restart registration.");
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    pending.otpCode = otpCode;
    pending.expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    return otpCode;
  }

  /**
   * Verify the 6-digit OTP and activate the user account
   */
  async verifyAndCreateUser(email: string, otpCode: string): Promise<UserAccount> {
    const cleanEmail = email.trim().toLowerCase();
    const pending = inMemoryPendingRegistrations.get(cleanEmail);

    if (!pending) {
      throw new Error("No pending registration found or session expired. Please register again.");
    }

    if (pending.otpCode !== otpCode.trim()) {
      throw new Error("Invalid 6-digit verification code. Please check your email.");
    }

    if (new Date(pending.expiresAt) < new Date()) {
      throw new Error("Verification code has expired. Please request a new one.");
    }

    const newUser: UserAccount = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: pending.name,
      email: pending.email,
      passwordHash: pending.passwordHash,
      profession: pending.profession,
      promoCodeUsed: pending.promoCode,
      isTrial: false,
      isActive: true,
      isEmailVerified: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    inMemoryUsers.unshift(newUser);
    inMemoryPendingRegistrations.delete(cleanEmail);

    return newUser;
  }

  /**
   * Direct registration (fallback / programmatic test helper)
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
   * Generate a 6-digit OTP verification code for an existing user
   */
  async generateVerificationCode(email: string): Promise<string> {
    const cleanEmail = email.trim().toLowerCase();
    const user = await this.findByEmail(cleanEmail);
    if (!user) {
      throw new Error("User account not found.");
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = code;
    user.verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    return code;
  }

  /**
   * Verify email using 6-digit OTP code for existing user
   */
  async verifyEmailCode(email: string, code: string): Promise<boolean> {
    const cleanEmail = email.trim().toLowerCase();
    const user = await this.findByEmail(cleanEmail);
    if (!user) return false;

    if (!user.verificationCode || user.verificationCode !== code.trim()) {
      return false;
    }

    if (user.verificationCodeExpires && new Date(user.verificationCodeExpires) < new Date()) {
      return false;
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
