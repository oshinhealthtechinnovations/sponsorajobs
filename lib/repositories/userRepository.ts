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
  subscriptionTier?: "FREE" | "PRO";
  subscriptionStatus?: "ACTIVE" | "INACTIVE" | "TRIALING" | "EXPIRED";
  subscriptionStartedAt?: string;
  proExpiresAt?: string;
  planCode?: string;
  planLabel?: string;
  stripeCustomerId?: string;
  stripeSessionId?: string;
  amountPaid?: number;
  currencyPaid?: string;
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
      const cleanEmail = user.email.toLowerCase().trim();
      const isPro = user.subscriptionTier === "PRO" || Boolean(user.isTrial);

      let promoCodeToStore = user.promoCodeUsed || "";
      if (isPro) {
        const subData = {
          tier: "PRO",
          status: user.subscriptionStatus || "ACTIVE",
          planCode: user.planCode || "SA_MONTH_199",
          planLabel: user.planLabel || "1 Month VIP (Candidate Pro)",
          amount: user.amountPaid || 199,
          currency: user.currencyPaid || "INR",
          paymentId: user.stripeCustomerId || user.stripeSessionId || "rzp_pay_verified",
          startedAt: user.subscriptionStartedAt || user.createdAt || new Date().toISOString(),
          expiresAt: user.proExpiresAt || new Date(Date.now() + 30 * 86400000).toISOString(),
        };
        promoCodeToStore = `PRO_SUB:${JSON.stringify(subData)}`;
      }

      // Check if candidate already exists in Supabase
      const checkRes = await fetch(`${supabaseUrl}/rest/v1/candidate_users?email=eq.${encodeURIComponent(cleanEmail)}&limit=1`, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      });

      const existingRows = checkRes.ok ? await checkRes.json() : [];
      const alreadyExists = Array.isArray(existingRows) && existingRows.length > 0;

      if (alreadyExists) {
        // Use PATCH to update existing record without violating unique email constraint
        const patchPayload: Record<string, any> = {
          name: user.name,
          profession: user.profession || "Candidate",
          promo_code: promoCodeToStore,
          is_email_verified: true,
          is_trial: isPro,
          is_active: user.isActive ?? true,
          last_login_at: user.lastLoginAt || new Date().toISOString(),
        };
        if (user.passwordHash) {
          patchPayload.password_hash = user.passwordHash;
        }

        const patchRes = await fetch(`${supabaseUrl}/rest/v1/candidate_users?email=eq.${encodeURIComponent(cleanEmail)}`, {
          method: "PATCH",
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify(patchPayload),
        });

        if (patchRes.ok || patchRes.status === 204) {
          console.log(`[UserRepository:Supabase] User ${cleanEmail} successfully updated (PRO=${isPro}).`);
          return true;
        }
      } else {
        // Insert new candidate record
        const insertPayload = {
          id: user.id || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          email: cleanEmail,
          name: user.name || "Candidate",
          password_hash: user.passwordHash || "",
          profession: user.profession || "Candidate",
          promo_code: promoCodeToStore,
          is_email_verified: true,
          is_trial: isPro,
          is_active: true,
          created_at: user.createdAt || new Date().toISOString(),
          last_login_at: user.lastLoginAt || new Date().toISOString(),
        };

        const postRes = await fetch(`${supabaseUrl}/rest/v1/candidate_users`, {
          method: "POST",
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify(insertPayload),
        });

        if (postRes.ok || postRes.status === 201) {
          console.log(`[UserRepository:Supabase] New user ${cleanEmail} successfully created (PRO=${isPro}).`);
          return true;
        }
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

          // Parse Pro Subscription from metadata if present
          let isPro = Boolean(row.is_trial);
          let subStatus: "ACTIVE" | "INACTIVE" | "TRIALING" | "EXPIRED" = "ACTIVE";
          let planCode = "SA_MONTH_199";
          let planLabel = "1 Month VIP (Candidate Pro)";
          let amountPaid = 199;
          let currencyPaid = "INR";
          let proExpiresAt = new Date(Date.now() + 30 * 86400000).toISOString();
          let startedAt = row.created_at || new Date().toISOString();
          let stripeCustomerId = undefined;

          if (row.promo_code && typeof row.promo_code === "string" && row.promo_code.startsWith("PRO_SUB:")) {
            try {
              const subJson = JSON.parse(row.promo_code.replace("PRO_SUB:", ""));
              if (subJson.tier === "PRO") {
                isPro = true;
                subStatus = subJson.status || "ACTIVE";
                planCode = subJson.planCode || planCode;
                planLabel = subJson.planLabel || planLabel;
                amountPaid = subJson.amount ?? amountPaid;
                currencyPaid = subJson.currency || currencyPaid;
                proExpiresAt = subJson.expiresAt || proExpiresAt;
                startedAt = subJson.startedAt || startedAt;
                stripeCustomerId = subJson.paymentId || stripeCustomerId;
              }
            } catch {
              // Ignore JSON parse errors
            }
          }

          const user: UserAccount = {
            id: row.id || `usr_${Date.now()}`,
            name: row.name || "Candidate",
            email: row.email,
            passwordHash: row.password_hash || row.passwordHash || "",
            profession: row.profession || "",
            promoCodeUsed: row.promo_code || "",
            isTrial: isPro,
            isActive: row.is_active ?? true,
            isEmailVerified: Boolean(row.is_email_verified),
            subscriptionTier: isPro ? "PRO" : "FREE",
            subscriptionStatus: isPro ? subStatus : "ACTIVE",
            subscriptionStartedAt: startedAt,
            proExpiresAt: isPro ? proExpiresAt : undefined,
            planCode: isPro ? planCode : undefined,
            planLabel: isPro ? planLabel : undefined,
            amountPaid: isPro ? amountPaid : undefined,
            currencyPaid: isPro ? currencyPaid : undefined,
            stripeCustomerId: stripeCustomerId,
            createdAt: row.created_at || new Date().toISOString(),
            lastLoginAt: row.last_login_at || new Date().toISOString(),
          };

          // Cache in memory
          const existingIdx = inMemoryUsers.findIndex((u) => u.email.toLowerCase() === user.email.toLowerCase());
          if (existingIdx >= 0) {
            inMemoryUsers[existingIdx] = user;
          } else {
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
   * Upgrade user to Candidate Pro with payment details
   */
  async upgradeUserToPro(
    emailOrId: string,
    details: {
      amountPaid: number;
      currency?: string;
      stripeSessionId?: string;
      stripeCustomerId?: string;
      planCode?: string;
      planLabel?: string;
      durationDays?: number;
    }
  ): Promise<UserAccount | null> {
    const cleanLookup = emailOrId.trim().toLowerCase();
    let user = await this.findByEmail(cleanLookup);
    if (!user) {
      user = inMemoryUsers.find((u) => u.id === emailOrId || u.email.toLowerCase() === cleanLookup) || null;
    }

    const durationDays = details.durationDays || (details.amountPaid === 199 ? 30 : details.amountPaid === 499 ? 90 : details.amountPaid === 799 ? 180 : 365);
    const startedAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();
    const planLabel = details.planLabel || (durationDays === 30 ? "1 Month VIP" : durationDays === 90 ? "3 Months VIP" : durationDays === 180 ? "6 Months VIP" : "12 Months (1 Year VIP)");
    const planCode = details.planCode || (durationDays === 30 ? "SA_MONTH_199" : durationDays === 90 ? "SA_3MONTH_499" : durationDays === 180 ? "SA_6MONTH_799" : "SA_YEAR_999");

    if (user) {
      user.subscriptionTier = "PRO";
      user.subscriptionStatus = "ACTIVE";
      user.isTrial = true;
      user.isEmailVerified = true;
      user.subscriptionStartedAt = user.subscriptionStartedAt || startedAt;
      user.proExpiresAt = expiresAt;
      user.planCode = planCode;
      user.planLabel = planLabel;
      user.amountPaid = details.amountPaid;
      user.currencyPaid = details.currency || "INR";
      user.stripeSessionId = details.stripeSessionId;
      user.stripeCustomerId = details.stripeCustomerId;
      await this.syncUserToSupabase(user);
      return user;
    }

    // If user record doesn't exist yet, create an instant verified PRO candidate account
    const newUser: UserAccount = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: "Pro Candidate",
      email: cleanLookup,
      passwordHash: "",
      profession: "Sponsored Professional",
      promoCodeUsed: "PAID_PRO",
      isTrial: true,
      isActive: true,
      isEmailVerified: true,
      subscriptionTier: "PRO",
      subscriptionStatus: "ACTIVE",
      subscriptionStartedAt: startedAt,
      proExpiresAt: expiresAt,
      planCode: planCode,
      planLabel: planLabel,
      amountPaid: details.amountPaid,
      currencyPaid: details.currency || "INR",
      stripeSessionId: details.stripeSessionId,
      stripeCustomerId: details.stripeCustomerId,
      createdAt: startedAt,
      lastLoginAt: startedAt,
    };

    inMemoryUsers.unshift(newUser);
    await this.syncUserToSupabase(newUser);
    return newUser;
  }

  /**
   * Get all registered users for admin telemetry
   */
  async getAllUsers(): Promise<UserAccount[]> {
    return inMemoryUsers;
  }
}

export const userRepository = new UserRepository();
