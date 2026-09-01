import { describe, it, expect, beforeEach } from "vitest";
import { userRepository } from "@/lib/repositories/userRepository";
import { applicationRepository } from "@/lib/repositories/applicationRepository";

describe("Candidate Email Verification & Application Tracker", () => {
  const testEmail = `candidate_${Date.now()}@example.com`;

  beforeEach(() => {
    applicationRepository.clearAll();
  });

  describe("1. Email Verification Code System", () => {
    it("should generate a 6-digit verification code and verify email successfully", async () => {
      // 1. Create a user
      const user = await userRepository.createUser({
        name: "Test Candidate",
        email: testEmail,
        password: "Password123!",
        profession: "Civil Engineer",
        promoCode: "sumit_raj_linkedin",
      });

      expect(user.isEmailVerified).toBe(false);

      // 2. Generate code
      const code = await userRepository.generateVerificationCode(testEmail);
      expect(code).toBeDefined();
      expect(code.length).toBe(6);
      expect(/^\d{6}$/.test(code)).toBe(true);

      // 3. Reject invalid code
      const invalidRes = await userRepository.verifyEmailCode(testEmail, "000000");
      expect(invalidRes).toBe(false);
      expect(user.isEmailVerified).toBe(false);

      // 4. Accept correct code
      const validRes = await userRepository.verifyEmailCode(testEmail, code);
      expect(validRes).toBe(true);
      expect(user.isEmailVerified).toBe(true);
    });

    it("should throw an error when generating code for non-existent email", async () => {
      await expect(
        userRepository.generateVerificationCode("nonexistent@example.com")
      ).rejects.toThrow("User account not found.");
    });
  });

  describe("2. Application Repository Tracker", () => {
    const userId = "usr_test_candidate_1";

    it("should create and track a new job application with APPLIED status", async () => {
      const app = await applicationRepository.createApplication({
        userId,
        jobId: "job_mace_101",
        jobTitle: "Senior Project Manager",
        companyName: "Mace",
        location: "Birmingham, UK",
        salary: "£75,000 / yr",
        applyUrl: "https://macegroup.com/careers/101",
        notes: "Applied via direct portal",
      });

      expect(app.id).toBeDefined();
      expect(app.status).toBe("APPLIED");
      expect(app.jobTitle).toBe("Senior Project Manager");
      expect(app.companyName).toBe("Mace");

      const userApps = await applicationRepository.getByUser(userId);
      expect(userApps.length).toBe(1);
      expect(userApps[0].id).toBe(app.id);
    });

    it("should update application status to INTERVIEWING, OFFER, and REJECTED", async () => {
      const app = await applicationRepository.createApplication({
        userId,
        jobId: "job_burns_202",
        jobTitle: "Civil Engineer",
        companyName: "Burns & McDonnell",
        applyUrl: "https://burnsmcd.jobs/202",
      });

      // Update to Interviewing
      const updatedInterview = await applicationRepository.updateStatus(
        app.id,
        userId,
        "INTERVIEWING",
        "HR screen passed. Technical interview next Tuesday."
      );
      expect(updatedInterview?.status).toBe("INTERVIEWING");
      expect(updatedInterview?.notes).toContain("Technical interview");

      // Update to Offer
      const updatedOffer = await applicationRepository.updateStatus(app.id, userId, "OFFER");
      expect(updatedOffer?.status).toBe("OFFER");

      // Update details
      const updatedDetails = await applicationRepository.updateDetails(app.id, userId, {
        salary: "£68,000 / yr",
      });
      expect(updatedDetails?.salary).toBe("£68,000 / yr");
    });

    it("should delete and untrack an application", async () => {
      const app = await applicationRepository.createApplication({
        userId,
        jobId: "job_delete_test",
        jobTitle: "Site Engineer",
        companyName: "Balfour Beatty",
        applyUrl: "https://balfourbeatty.com",
      });

      const deleted = await applicationRepository.deleteApplication(app.id, userId);
      expect(deleted).toBe(true);

      const userApps = await applicationRepository.getByUser(userId);
      expect(userApps.length).toBe(0);
    });
  });
});
