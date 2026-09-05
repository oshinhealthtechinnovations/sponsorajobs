import { NextRequest, NextResponse } from "next/server";
import { CareerIntelligenceEngine } from "@/lib/services/careerIntelligenceEngine";
import { extractTextFromPDFBuffer, isRawPdfSyntax } from "@/lib/services/pdfExtractor";

export const dynamic = "force-dynamic";

function extractPartsFromRawMultipart(buf: Buffer, boundary: string) {
  const boundaryBuf = Buffer.from("--" + boundary);
  let pos = 0;
  const parts: { name: string; filename?: string; data: Buffer; text: string }[] = [];
  while (pos < buf.length) {
    const bStart = buf.indexOf(boundaryBuf, pos);
    if (bStart === -1) break;
    const nextB = buf.indexOf(boundaryBuf, bStart + boundaryBuf.length);
    if (nextB === -1) break;
    const partBuf = buf.subarray(bStart + boundaryBuf.length, nextB);
    const headerEnd = partBuf.indexOf(Buffer.from("\r\n\r\n"));
    if (headerEnd !== -1) {
      const headerStr = partBuf.subarray(0, headerEnd).toString("utf-8");
      let bodyBuf = partBuf.subarray(headerEnd + 4);
      if (bodyBuf.length >= 2 && bodyBuf[bodyBuf.length - 2] === 13 && bodyBuf[bodyBuf.length - 1] === 10) {
        bodyBuf = bodyBuf.subarray(0, bodyBuf.length - 2);
      }
      const nameMatch = headerStr.match(/name="([^"]+)"/);
      const filenameMatch = headerStr.match(/filename="([^"]+)"/);
      parts.push({
        name: nameMatch ? nameMatch[1] : "",
        filename: filenameMatch ? filenameMatch[1] : undefined,
        data: Buffer.from(bodyBuf),
        text: bodyBuf.toString("utf-8"),
      });
    }
    pos = nextB;
  }
  return parts;
}

export async function POST(request: NextRequest) {
  try {
    let rawInput = "";
    let country: string | undefined;
    let minSalary: number | undefined;
    let limit = 8;

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      let fileBuffer: Buffer | null = null;
      let fileName = "";
      let textParam: string | null = null;
      let promptParam: string | null = null;

      try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        textParam = formData.get("text") as string | null;
        promptParam = formData.get("prompt") as string | null;
        country = (formData.get("country") as string) || undefined;
        const limitParam = formData.get("limit") as string | null;
        if (limitParam) limit = Number(limitParam) || 8;

        if (file) {
          fileBuffer = Buffer.from(await file.arrayBuffer());
          fileName = file.name.toLowerCase();
        }
      } catch (formErr) {
        // Robust fallback to raw buffer extraction if request.formData() fails in serverless runtime
        try {
          const rawBuffer = Buffer.from(await request.arrayBuffer());
          const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
          const boundary = boundaryMatch ? (boundaryMatch[1] || boundaryMatch[2]).trim() : "";
          if (boundary && rawBuffer.length > 0) {
            const parts = extractPartsFromRawMultipart(rawBuffer, boundary);
            for (const part of parts) {
              if (part.filename || part.name === "file") {
                fileBuffer = part.data;
                fileName = (part.filename || "upload.pdf").toLowerCase();
              } else if (part.name === "text") {
                textParam = part.text.trim();
              } else if (part.name === "prompt") {
                promptParam = part.text.trim();
              } else if (part.name === "country" && part.text.trim()) {
                country = part.text.trim();
              } else if (part.name === "limit" && part.text.trim()) {
                limit = Number(part.text.trim()) || 8;
              }
            }
          }
        } catch (rawErr) {
          console.warn("[SmartJobMatch API] Raw multipart fallback also failed:", rawErr);
        }
      }

      if (fileBuffer && fileBuffer.length > 0) {
        if (fileName.endsWith(".pdf") || fileBuffer.subarray(0, 5).toString().includes("%PDF")) {
          rawInput = await extractTextFromPDFBuffer(fileBuffer);
        } else {
          rawInput = fileBuffer.toString("utf-8");
        }
      } else if (textParam) {
        rawInput = textParam;
      } else if (promptParam) {
        rawInput = promptParam;
      }
    } else {
      let body: any = {};
      try {
        body = await request.json();
      } catch {
        body = {};
      }
      const { prompt, cvText, country: countryBody, minSalary: minSalaryBody, limit: limitBody } = body;
      rawInput = (cvText || prompt || "").trim();
      country = countryBody;
      minSalary = minSalaryBody;
      if (limitBody) limit = Number(limitBody) || 8;
    }

    rawInput = rawInput.trim();

    if (!rawInput || rawInput.length < 15 || isRawPdfSyntax(rawInput)) {
      return NextResponse.json(
        {
          success: false,
          error: "Could not extract readable text from this document. Please ensure your PDF has an embedded text layer (not a scanned flat image) or paste your background/skills directly.",
        },
        { status: 400 }
      );
    }

    // 1. Universal Capability Profile Extraction via CIE-v2
    const profile = CareerIntelligenceEngine.extractCandidateProfile(rawInput);
    const effectiveCountry = (country && country !== "ALL")
      ? country
      : (profile.identity.targetCountry || undefined);

    // 2. Rank Opportunities across Database using Universal Engine
    const rankedOpportunities = await CareerIntelligenceEngine.rankMatchingJobs(
      profile,
      {
        country: effectiveCountry,
        limit,
      }
    );

    const matchedJobs = rankedOpportunities.map((opp) => ({
      job: opp.job,
      matchTier: opp.matchTier,
      tierBadgeLabel: opp.tierBadgeLabel,
      matchScore: opp.compositeRankScore,
      careerMatchScore: opp.careerMatchScore,
      sponsorshipViabilityScore: opp.sponsorshipViabilityScore,
      atsScore: opp.atsCompatibilityScore,
      breakdown: opp.breakdown,
      visaViable: opp.sponsorshipViabilityScore >= 75,
      reasons: opp.breakdown.whyYouMatch.length > 0 ? opp.breakdown.whyYouMatch : [opp.recommendationReason],
      recommendationReason: opp.recommendationReason,
      matchedSkills: Array.from(new Set([...opp.breakdown.matchedTools, ...opp.breakdown.matchedCapabilities])),
      missingSkills: opp.breakdown.missingCapabilities,
      sponsorshipStatus: opp.breakdown.sponsorshipStatus.certainty,
    }));

    // Universal Candidate Profile compatibility layer for UI
    const candidateProfile = {
      name: profile.identity.name,
      email: profile.identity.email,
      phone: profile.identity.phone,
      linkedIn: profile.identity.linkedIn,
      currentRole: profile.headlineRole,
      normalizedRole: profile.normalizedRole,
      primaryFunction: profile.primaryFunction,
      yearsOfExperience: profile.yearsOfExperience,
      seniority: profile.seniority,
      primaryIndustry: profile.primaryIndustry,
      subIndustries: profile.subIndustries,
      coreSkills: Array.from(new Set([...profile.toolsAndSoftware, ...profile.coreCapabilities])),
      technicalSkills: profile.toolsAndSoftware,
      softSkills: profile.coreCapabilities.filter((c) => c.includes("Management") || c.includes("Coordination")),
      toolsAndSoftware: profile.toolsAndSoftware,
      highestDegree: profile.highestDegree,
      degreeField: profile.degreeField,
      certifications: profile.certifications,
      transferablePotentialRoles: profile.transferableRolesList,
      transferableCareerPathways: profile.transferableCareerPathways,
      targetCountry: profile.identity.targetCountry,
    };

    return NextResponse.json({
      success: true,
      data: {
        candidateProfile,
        transferableRoles: profile.transferableRolesList,
        transferableCareerPathways: profile.transferableCareerPathways,
        detectedIntent: {
          targetRole: profile.normalizedRole,
          skills: candidateProfile.coreSkills,
          targetCountry: effectiveCountry,
          experienceLevel: profile.seniority,
        },
        matchedJobs,
        totalFound: matchedJobs.length,
      },
    });
  } catch (err: any) {
    console.error("[SmartJobMatch API] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to perform smart match" },
      { status: 500 }
    );
  }
}
