/**
 * User & Free Trial Request Repository
 * Handles user authentication, referral code validation (sumit_raj_linkedin), email OTP verification, trial requests, Supabase database persistence, and Forgot/Reset Password workflows.
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
  resetCode?: string;
  resetCodeExpires?: string;
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

export interface PendingPasswordReset {
  email: string;
  resetCode: string;
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

// In-memory stores (Fast local cache)
let inMemoryUsers: UserAccount[] = [];
let inMemoryPendingRegistrations: Map<string, PendingRegistration> = new Map();
let inMemoryPendingResets: Map<string, PendingPasswordReset> = new Map();
let inMemoryTrialRequests: TrialAccessRequest[] = [];

export const VALID_PROMO_CODES = ["sumit_raj_linkedin"];

/**
 * Hash a password using SHA-256 via SubtleCrypto (edge-runtime compatible, zero dependencies).
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createPendingToken(data: PendingRegistration): Promise<string> {
  const payload = JSON.stringify(data);
  const secret = process.env.ADMIN_SECRET || "sponsorajobs_secure_auth_secret_key_2026";
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(payload));
  const sigHex = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const payloadB64 = Buffer.from(payload).toString("base64url");
  return `${payloadB64}.${sigHex}`;
}

export async function verifyPendingToken(tokenStr?: string | null): Promise<PendingRegistration | null> {
  if (!tokenStr || !tokenStr.includes(".")) return null;
  try {
    const [payloadB64, sigHex] = tokenStr.split(".");
    if (!payloadB64 || !sigHex) return null;
    const payload = Buffer.from(payloadB64, "base64url").toString("utf-8");
    const secret = process.env.ADMIN_SECRET || "sponsorajobs_secure_auth_secret_key_2026";
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const sigBytes = new Uint8Array(sigHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)));
    const isValid = await crypto.subtle.verify("HMAC", cryptoKey, sigBytes, encoder.encode(payload));
    if (!isValid) return null;
    return JSON.parse(payload) as PendingRegistration;
  } catch {
    return null;
  }
}

export async function createResetToken(data: PendingPasswordReset): Promise<string> {
  const payload = JSON.stringify(data);
  const secret = process.env.ADMIN_SECRET || "sponsorajobs_secure_auth_secret_key_2026";
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(payload));
  const sigHex = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const payloadB64 = Buffer.from(payload).toString("base64url");
  return `${payloadB64}.${sigHex}`;
}

export async function verifyResetToken(tokenStr?: string | null): Promise<PendingPasswordReset | null> {
  if (!tokenStr || !tokenStr.includes(".")) return null;
  try {
    const [payloadB64, sigHex] = tokenStr.split(".");
    if (!payloadB64 || !sigHex) return null;
    const payload = Buffer.from(payloadB64, "base64url").toString("utf-8");
    const secret = process.env.ADMIN_SECRET || "sponsorajobs_secure_auth_secret_key_2026";
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const sigBytes = new Uint8Array(sigHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)));
    const isValid = await crypto.subtle.verify("HMAC", cryptoKey, sigBytes, encoder.encode(payload));
    if (!isValid) return null;
    return JSON.parse(payload) as PendingPasswordReset;
  } catch {
    return null;
  }
}

export class UserRepository {
  /**
   * Helper to sync a user record to Supabase Cloud Postgres database
   */
  private async syncUserToSupabase(user: UserAccount): Promise<boolean> {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) return false;

    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/candidate_users`, {
        method: "POST",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates,return=minimal",
        },
        body: JSON.stringify({
          id: user.id,
          email: user.email.toLowerCase(),
          name: user.name,
          password_hash: user.passwordHash,
          profession: user.profession,
          promo_code: user.promoCodeUsed,
          is_email_verified: user.isEmailVerified,
          is_trial: user.isTrial,
          is_active: user.isActive,
          created_at: user.createdAt,
          last_login_at: user.lastLoginAt,
        }),
      });

      if (res.ok || res.status === 201) {
        console.log(`[UserRepository:Supabase] User ${user.email} synced to Supabase.`);
        return true;
      } else {
        // Fallback: check if table name is users
        const errText = await res.text();
        console.warn("[UserRepository:Supabase] Supabase sync returned status:", res.status, errText);
      }
    } catch (err) {
      console.warn("[UserRepository:Supabase] Network error syncing user:", err);
    }
    return false;
  }

  /**
   * Helper to fetch user from Supabase Cloud Postgres
   */
  private async findUserInSupabase(email: string): Promise<UserAccount | null> {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) return null;

    try {
      const cleanEmail = encodeURIComponent(email.toLowerCase().trim());
      const res = await fetch(`${supabaseUrl}/rest/v1/candidate_users?email=eq.${cleanEmail}&limit=1`, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      });

      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows) && rows.length > 0) {
          const row = rows[0];
          const user: UserAccount = {
            id: row.id || `usr_${Date.now()}`,
            name: row.name || "Candidate",
            email: row.email,
            passwordHash: row.password_hash || row.passwordHash || "",
            profession: row.profession || "",
            promoCodeUsed: row.promo_code || row.promoCodeUsed || "",
            isTrial: Boolean(row.is_trial),
            isActive: row.is_active ?? true,
            isEmailVerified: Boolean(row.is_email_verified),
            createdAt: row.created_at || new Date().toISOString(),
            lastLoginAt: row.last_login_at || new Date().toISOString(),
          };
          // Cache in memory
          if (!inMemoryUsers.some((u) => u.email.toLowerCase() === user.email.toLowerCase())) {
            inMemoryUsers.unshift(user);
          }
          return user;
        }
      }
    } catch (err) {
      console.warn("[UserRepository:Supabase] Error reading from Supabase:", err);
    }
    return null;
  }

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
   * Find a user by email (Checks memory first, falls back to Supabase)
   */
  async findByEmail(email: string): Promise<UserAccount | null> {
    const cleanEmail = email.trim().toLowerCase();
    const localUser = inMemoryUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (localUser) return localUser;

    // Fallback to Supabase Cloud DB
    const cloudUser = await this.findUserInSupabase(cleanEmail);
    return cloudUser;
  }

  /**
   * Stage a pending registration and generate a 6-digit OTP code (stateless + in-memory)
   */
  async createPendingRegistration(data: {
    name: string;
    email: string;
    password: string;
    profession: string;
    promoCode?: string;
  }): Promise<{ otpCode: string; email: string; pendingToken: string }> {
    const cleanEmail = data.email.trim().toLowerCase();
    const existing = await this.findByEmail(cleanEmail);
    if (existing) {
      throw new Error("An account with this email address already exists. Please sign in.");
    }

    const hashedPassword = await hashPassword(data.password);
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const pendingData: PendingRegistration = {
      name: data.name.trim(),
      email: cleanEmail,
      passwordHash: hashedPassword,
      profession: data.profession.trim(),
      promoCode: data.promoCode ? data.promoCode.trim().toLowerCase() : "",
      otpCode,
      expiresAt,
    };

    inMemoryPendingRegistrations.set(cleanEmail, pendingData);
    const pendingToken = await createPendingToken(pendingData);

    return { otpCode, email: cleanEmail, pendingToken };
  }

  /**
   * Resend a fresh 6-digit OTP code for a pending registration
   */
  async resendRegistrationOtp(
    email: string,
    existingToken?: string | null
  ): Promise<{ otpCode: string; pendingToken: string }> {
    const cleanEmail = email.trim().toLowerCase();
    let pending = await verifyPendingToken(existingToken);

    if (!pending) {
      pending = inMemoryPendingRegistrations.get(cleanEmail) || null;
    }

    if (!pending || pending.email.toLowerCase() !== cleanEmail) {
      throw new Error("No pending registration found for this email. Please restart registration.");
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    pending.otpCode = otpCode;
    pending.expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    inMemoryPendingRegistrations.set(cleanEmail, pending);
    const pendingToken = await createPendingToken(pending);

    return { otpCode, pendingToken };
  }

  /**
   * Verify the 6-digit OTP and activate the user account (syncs to Supabase Cloud)
   */
  async verifyAndCreateUser(email: string, otpCode: string, pendingToken?: string | null): Promise<UserAccount> {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Try resolving from stateless signed token first (serverless-resilient)
    let pending = await verifyPendingToken(pendingToken);

    // 2. Fallback to in-memory store
    if (!pending) {
      pending = inMemoryPendingRegistrations.get(cleanEmail) || null;
    }

    if (!pending || pending.email.toLowerCase() !== cleanEmail) {
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

    // Sync to Supabase Cloud Database asynchronously
    this.syncUserToSupabase(newUser).catch(() => {});

    return newUser;
  }

  /**
   * Direct registration helper
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
    this.syncUserToSupabase(newUser).catch(() => {});
    return newUser;
  }

  /**
   * Create a Password Reset Request & 6-digit OTP code (Auto-creates candidate if not present)
   */
  async createPasswordResetRequest(email: string): Promise<{
    resetCode: string;
    resetToken: string;
    user: UserAccount;
  }> {
    const cleanEmail = email.trim().toLowerCase();
    let user = await this.findByEmail(cleanEmail);

    if (!user) {
      const defaultName = cleanEmail.split("@")[0].replace(/[._]/g, " ");
      user = {
        id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: defaultName.charAt(0).toUpperCase() + defaultName.slice(1),
        email: cleanEmail,
        passwordHash: "",
        profession: "Candidate",
        promoCodeUsed: "",
        isTrial: false,
        isActive: true,
        isEmailVerified: false,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const resetData: PendingPasswordReset = {
      email: cleanEmail,
      resetCode,
      expiresAt,
    };

    inMemoryPendingResets.set(cleanEmail, resetData);
    user.resetCode = resetCode;
    user.resetCodeExpires = expiresAt;

    const resetToken = await createResetToken(resetData);

    return { resetCode, resetToken, user };
  }

  /**
   * Verify Reset OTP and update/activate user password
   */
  async verifyAndResetPassword(
    email: string,
    resetCode: string,
    newPassword: string,
    resetToken?: string | null
  ): Promise<UserAccount> {
    const cleanEmail = email.trim().toLowerCase();
    let resetData = await verifyResetToken(resetToken);

    if (!resetData) {
      resetData = inMemoryPendingResets.get(cleanEmail) || null;
    }

    let user = await this.findByEmail(cleanEmail);

    const expectedCode = resetData?.resetCode || user?.resetCode;
    const expiresAt = resetData?.expiresAt || user?.resetCodeExpires;

    if (!expectedCode || expectedCode !== resetCode.trim()) {
      throw new Error("Invalid 6-digit password reset code.");
    }

    if (expiresAt && new Date(expiresAt) < new Date()) {
      throw new Error("Password reset code has expired. Please request a new one.");
    }

    const newHashedPassword = await hashPassword(newPassword);

    if (!user) {
      const defaultName = cleanEmail.split("@")[0].replace(/[._]/g, " ");
      user = {
        id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: defaultName.charAt(0).toUpperCase() + defaultName.slice(1),
        email: cleanEmail,
        passwordHash: newHashedPassword,
        profession: "Candidate",
        promoCodeUsed: "",
        isTrial: false,
        isActive: true,
        isEmailVerified: true,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
      inMemoryUsers.unshift(user);
    } else {
      user.passwordHash = newHashedPassword;
      user.isEmailVerified = true;
      user.resetCode = undefined;
      user.resetCodeExpires = undefined;
      user.lastLoginAt = new Date().toISOString();
    }

    inMemoryPendingResets.delete(cleanEmail);

    // Sync updated user to Supabase
    this.syncUserToSupabase(user).catch(() => {});

    return user;
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

    this.syncUserToSupabase(user).catch(() => {});
    return true;
  }

  /**
   * Authenticate user with email and password (Memory + Supabase)
   */
  async authenticate(email: string, password: string): Promise<UserAccount | null> {
    const cleanEmail = email.trim().toLowerCase();
    const user = await this.findByEmail(cleanEmail);
    if (!user) return null;
    const hashedInput = await hashPassword(password);
    if (user.passwordHash !== hashedInput) return null;

    user.lastLoginAt = new Date().toISOString();
    this.syncUserToSupabase(user).catch(() => {});
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
