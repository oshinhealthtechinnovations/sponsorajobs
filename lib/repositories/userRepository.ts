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

export class UserRepository {
  /**
   * Validate if the provided promo/referral code is valid
   */
  isValidPromoCode(code: string): boolean {
    if (!code) return false;
    const clean = code.trim().toLowerCase();
    return VALID_PROMO_CODES.includes(clean);
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

    const newUser: UserAccount = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: data.name.trim(),
      email: cleanEmail,
      passwordHash: data.password, // In edge env, simplified hashing/storing
      profession: data.profession.trim(),
      promoCodeUsed: data.promoCode.trim().toLowerCase(),
      isTrial: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    inMemoryUsers.unshift(newUser);
    return newUser;
  }

  /**
   * Authenticate user with email and password
   */
  async authenticate(email: string, password: string): Promise<UserAccount | null> {
    const cleanEmail = email.trim().toLowerCase();
    const user = inMemoryUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) return null;
    if (user.passwordHash !== password) return null;

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
