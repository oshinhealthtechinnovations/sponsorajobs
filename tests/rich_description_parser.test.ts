import { describe, it, expect } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { RichJobDescription } from "../components/RichJobDescription";

describe("RichJobDescription Layout & Clean Prose Engine", () => {
  const sampleAirForceDescription = `
Click on "Learn more about this agency" button below to view Eligibilities being considered and other IMPORTANT information. The primary purpose of this position is: This is a formal Air Force intern position, established under the PALACE Acquire (PAQ) program which is under the Pathways Recent Graduate Program. This position is centrally managed and funded by the Air Force Personnel Center, Civilian Career Management Directorate and administered by the Civil Engineer Career Team.

In order to qualify, you must meet the specialized experience requirements described in the Office of Personnel Management (OPM) Qualification Standards for General Schedule Positions, for Professional and Scientific Positions and Professional Engineering Positions, 0800 Basic Requirements: Combination of education and experience -- college-level education Degree: Engineering. OR Leading to a bachelor's degree in a school of engineering with at least one program accredited by ABET; OR Include differential and integral calculus and courses (more advanced than first-year physics and chemistry) in five of the following seven areas of engineering science or physics: (a) statics, dynamics; (b) strength of materials (stress-strain relationships); (c) fluid mechanics, hydraulics; (d) thermodynamics; (e) electrical fields and circuits; (f) nature and properties of materials (relating particle and aggregate structure to properties); and (g) any other comparable area of fundamental engineering science or physics, such as optics, heat transfer, soil mechanics, or electronics. OR Training, and/or technical experience that furnish 1. A thorough knowledge of the physical and mathematical sciences underlying engineering. 2. A good understanding, both theoretical and practical, of the engineering sciences and techniques and their applications to one of the branches of engineering.
PART-TIME
  `;

  it("renders clean editorial prose and strips scraper boilerplate", () => {
    const html = renderToString(
      React.createElement(RichJobDescription, {
        description: sampleAirForceDescription,
        companyName: "U.S. Air Force",
        countryCode: "US",
        applyUrl: "https://usajobs.gov/job/123",
      })
    );

    // Verify header presence
    expect(html).toContain("Job Description &amp; Specifications");

    // Verify auto-detected clean section headings
    expect(html).toContain("Role Purpose &amp; Overview");
    expect(html).toContain("Basic Requirements &amp; Qualifications");

    // Verify that scraper boilerplate was stripped
    expect(html).not.toContain("Click on &quot;Learn more about this agency&quot;");
    expect(html).not.toContain("view Eligibilities being considered");

    // Verify clean list items
    expect(html).toContain("statics, dynamics");
    expect(html).toContain("fluid mechanics, hydraulics");

    // Verify key competencies tags without redundancy
    expect(html).toContain("Civil Engineer");
    expect(html).toContain("ABET");
  });
});
