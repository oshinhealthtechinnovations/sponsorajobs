import { describe, it, expect } from "vitest";
import { userRepository, VALID_PROMO_CODES } from "../lib/repositories/userRepository";

describe("User Authentication & Referral Code Gate", () => {
  it("should recognize sumit_raj_linkedin as an authorized valid promo code", () => {
    expect(userRepository.isValidPromoCode("sumit_raj_linkedin")).toBe(true);
    expect(userRepository.isValidPromoCode("SUMIT_RAJ_LINKEDIN ")).toBe(true);
    expect(userRepository.isValidPromoCode("sumit_raj_linkedin")).toBe(true);
  });

  it("should reject invalid promo codes", () => {
    expect(userRepository.isValidPromoCode("random_code")).toBe(false);
    expect(userRepository.isValidPromoCode("")).toBe(false);
    expect(userRepository.isValidPromoCode("free100")).toBe(false);
  });

  it("should allow account creation when valid promo code is provided", async () => {
    const user = await userRepository.createUser({
      name: "Jane Doe",
      email: "jane.doe@example.com",
      password: "securepassword123",
      profession: "Senior Software Engineer",
      promoCode: "sumit_raj_linkedin",
    });

    expect(user.id).toBeDefined();
    expect(user.email).toBe("jane.doe@example.com");
    expect(user.promoCodeUsed).toBe("sumit_raj_linkedin");
    expect(user.isActive).toBe(true);
  });

  it("should authenticate registered user with email and password", async () => {
    const authUser = await userRepository.authenticate("jane.doe@example.com", "securepassword123");
    expect(authUser).not.toBeNull();
    expect(authUser?.name).toBe("Jane Doe");

    const invalidAuth = await userRepository.authenticate("jane.doe@example.com", "wrongpassword");
    expect(invalidAuth).toBeNull();
  });

  it("should record Free Trial Access Requests with profession and contact info", async () => {
    const trialRequest = await userRepository.createTrialRequest({
      name: "David Smith",
      email: "david.smith@example.com",
      profession: "Registered General Nurse",
    });

    expect(trialRequest.id).toBeDefined();
    expect(trialRequest.name).toBe("David Smith");
    expect(trialRequest.profession).toBe("Registered General Nurse");
    expect(trialRequest.status).toBe("pending");

    const allRequests = await userRepository.getAllTrialRequests();
    expect(allRequests.length).toBeGreaterThanOrEqual(1);
    expect(allRequests.some((r) => r.email === "david.smith@example.com")).toBe(true);
  });
});
