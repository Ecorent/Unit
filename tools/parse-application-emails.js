const fs = require("fs");
const path = require("path");

const inputDir = path.resolve(__dirname, "..", "imports", "applications");
const outputPath = path.join(inputDir, "applications-import.json");

const fieldLabels = [
  ["unitName", "Apartment"],
  ["slug", "Slug"],
  ["submittedDisplay", "Submitted"],
  ["fullName", "Full Legal Name"],
  ["dateOfBirth", "Date of Birth"],
  ["phone", "Phone Number"],
  ["email", "Email Address"],
  ["sensitiveGovernmentId", "Government ID Type & Number"],
  ["sensitiveSocialSecurity", "Social Security Number"],
  ["socialMedia", "Social Media Links"],
  ["occupants", "All Occupants"],
  ["occupantCount", "Total Number of Occupants"],
  ["moveInDate", "Desired Move-In Date"],
  ["currentAddress", "Current Address"],
  ["landlordContact", "Landlord Name & Contact"],
  ["monthlyRent", "Monthly Rent/Mortgage"],
  ["residencyLength", "Length of Residency"],
  ["leavingReason", "Reason for Leaving"],
  ["evicted", "Evicted?"],
  ["evictionExplanation", "Eviction Explanation"],
  ["brokenLease", "Broken Lease?"],
  ["brokenLeaseExplanation", "Broken Lease Explanation"],
  ["employer", "Employer Name"],
  ["jobTitle", "Job Title"],
  ["employmentLength", "Length of Employment"],
  ["monthlyIncome", "Monthly Gross Income"],
  ["otherIncome", "Other Income"],
  ["backgroundNotes", "Credit/Background Notes"],
  ["bankruptcy", "Bankruptcy?"],
  ["bankruptcyExplanation", "Bankruptcy Explanation"],
  ["criminalConviction", "Criminal Conviction?"],
  ["convictionExplanation", "Conviction Explanation"],
  ["pets", "Pets?"],
  ["petType", "Type"],
  ["petBreed", "Breed"],
  ["petWeight", "Weight"],
  ["petCount", "Number of Pets"],
  ["screeningAuthorization", "Screening Authorization"],
  ["screeningSignature", "Screening Signature"],
  ["screeningDate", "Screening Date"],
  ["acknowledgment", "Final Acknowledgment"],
  ["finalSignature", "Applicant Signature(s)"],
  ["finalDate", "Final Date"]
];

function main() {
  if (!fs.existsSync(inputDir)) {
    throw new Error(`Import folder not found: ${inputDir}`);
  }

  const files = fs.readdirSync(inputDir)
    .filter(file => file.toLowerCase().endsWith(".eml"))
    .sort();

  if (!files.length) {
    throw new Error(`No .eml files found in ${inputDir}`);
  }

  const applications = files.map(file => parseEmail(path.join(inputDir, file), file));

  fs.writeFileSync(
    outputPath,
    JSON.stringify({ generatedAt: new Date().toISOString(), applications }, null, 2),
    "utf8"
  );

  console.log(`Parsed ${applications.length} application email(s).`);
  console.log(`Wrote ${outputPath}`);
}

function parseEmail(filePath, fileName) {
  const raw = fs.readFileSync(filePath, "utf8");
  const headers = parseHeaders(raw);
  const text = extractPlainText(raw);
  const fields = extractFields(text);
  const rank = extractRank(text, headers.subject || fileName);
  const submittedAtClient = parseSubmittedDate(fields.submittedDisplay, headers.date);
  const applicantName = fields.fullName || extractNameFromSubject(headers.subject || fileName);
  const applicantEmail = fields.email || "";
  const applicantPhone = fields.phone || "";
  const unitName = fields.unitName || extractUnitFromSubject(headers.subject || fileName);

  return {
    importKey: buildImportKey(applicantName, applicantEmail, submittedAtClient, unitName),
    sourceFile: fileName,
    applicantName,
    applicantEmail,
    applicantPhone,
    unitName,
    status: "New",
    rankingScore: rank.score,
    rankingBand: rank.band,
    rankingFactors: rank.factors,
    submittedAtClient,
    searchText: [
      applicantName,
      applicantEmail,
      applicantPhone,
      unitName,
      fields.slug
    ].filter(Boolean).join(" ").toLowerCase(),
    ...normalizeFields(fields)
  };
}

function parseHeaders(raw) {
  const headerText = raw.split(/\r?\n\r?\n/)[0] || "";
  const unfolded = headerText.replace(/\r?\n[ \t]+/g, " ");
  const headers = {};

  unfolded.split(/\r?\n/).forEach(line => {
    const index = line.indexOf(":");
    if (index === -1) return;

    const key = line.slice(0, index).trim().toLowerCase();
    headers[key] = line.slice(index + 1).trim();
  });

  return {
    subject: headers.subject || "",
    date: headers.date || ""
  };
}

function extractPlainText(raw) {
  const plainStart = raw.search(/Content-Type:\s*text\/plain/i);
  if (plainStart === -1) {
    throw new Error("No text/plain email part found.");
  }

  const part = raw.slice(plainStart);
  const bodyStartMatch = part.match(/\r?\n\r?\n/);
  if (!bodyStartMatch) {
    throw new Error("Could not locate text/plain body.");
  }

  const bodyStart = bodyStartMatch.index + bodyStartMatch[0].length;
  const body = part.slice(bodyStart);
  const nextBoundary = body.search(/\r?\n--/);
  const encoded = nextBoundary === -1 ? body : body.slice(0, nextBoundary);

  return decodeQuotedPrintable(encoded)
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\u00a0/g, " ")
    .trim();
}

function decodeQuotedPrintable(value) {
  const withoutSoftBreaks = value.replace(/=\r?\n/g, "");
  const binary = withoutSoftBreaks.replace(/=([0-9A-Fa-f]{2})/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16))
  );

  return Buffer.from(binary, "binary").toString("utf8");
}

function extractFields(text) {
  const matches = [];

  for (const [key, label] of fieldLabels) {
    const pattern = new RegExp(`(^|\\n)${escapeRegExp(label)}:\\s*`, "i");
    const match = pattern.exec(text);
    if (!match) continue;

    matches.push({
      key,
      label,
      start: match.index + match[1].length,
      valueStart: match.index + match[0].length
    });
  }

  matches.sort((a, b) => a.start - b.start);

  return matches.reduce((fields, match, index) => {
    const next = matches[index + 1];
    const rawValue = text.slice(match.valueStart, next ? next.start : text.length);
    fields[match.key] = cleanValue(rawValue);
    return fields;
  }, {});
}

function cleanValue(value) {
  return value
    .replace(/\n[A-Z][A-Z &/]+(?:\n|$)/g, "\n")
    .replace(/\n-{5,}[\s\S]*$/g, "")
    .replace(/This notification was generated[\s\S]*$/i, "")
    .split("\n")
    .map(line => line.trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractRank(text, fallback) {
  const scoreMatch = text.match(/Score:\s*(\d+)\s*\/\s*100\s*([^\n]+)/i)
    || fallback.match(/Rank\s+(\d+)[_/]100/i);
  const score = scoreMatch ? Number(scoreMatch[1]) : 0;
  const band = scoreMatch && scoreMatch[2]
    ? scoreMatch[2].trim()
    : getBandFromScore(score);
  const factors = extractRankingFactors(text);

  return {
    score,
    band: normalizeBand(band, score),
    factors: factors.length ? factors : [{ points: 0, label: "Imported from prior email application" }]
  };
}

function extractRankingFactors(text) {
  const start = text.search(/INTERNAL CANDIDATE RANK/i);
  const end = text.search(/APPLICANT INFORMATION/i);
  if (start === -1 || end === -1 || end <= start) return [];

  return text.slice(start, end)
    .split("\n")
    .map(line => line.replace(/^\s*\*\s*/, "").trim())
    .filter(line => line && !/^Score:/i.test(line) && !/INTERNAL CANDIDATE RANK/i.test(line))
    .map(line => {
      const pointsMatch = line.match(/^(-?\d+)\s+(.+)$/);
      return pointsMatch
        ? { points: Number(pointsMatch[1]), label: pointsMatch[2].trim() }
        : { points: 0, label: line };
    });
}

function normalizeFields(fields) {
  const normalized = { ...fields };

  delete normalized.submittedDisplay;
  delete normalized.sensitiveGovernmentId;
  delete normalized.sensitiveSocialSecurity;

  for (const key of ["occupantCount", "monthlyRent", "monthlyIncome", "petCount"]) {
    if (normalized[key] == null || normalized[key] === "") continue;

    const number = Number(String(normalized[key]).replace(/[,$]/g, ""));
    if (Number.isFinite(number)) {
      normalized[key] = number;
    }
  }

  for (const key of ["screeningAuthorization", "acknowledgment"]) {
    normalized[key] = /^yes$/i.test(String(normalized[key] || "").trim());
  }

  return normalized;
}

function parseSubmittedDate(displayDate, headerDate) {
  const date = displayDate ? new Date(displayDate) : new Date(headerDate);
  if (!Number.isNaN(date.getTime())) {
    return date.toISOString();
  }

  return new Date().toISOString();
}

function extractNameFromSubject(subject) {
  const parts = subject.split(" - ");
  return parts.length ? parts[parts.length - 1].trim() : "";
}

function extractUnitFromSubject(subject) {
  const match = subject.match(/New Rental Application\s*-\s*(.+?)\s*-\s*.+$/i);
  return match ? match[1].trim() : "";
}

function buildImportKey(name, email, submittedAt, unitName) {
  return [name, email, submittedAt, unitName]
    .join("|")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeBand(band, score) {
  const normalized = String(band || "").trim();
  if (["Strong", "Review", "Needs careful review", "High concern"].includes(normalized)) {
    return normalized;
  }

  return getBandFromScore(score);
}

function getBandFromScore(score) {
  if (score >= 85) return "Strong";
  if (score >= 70) return "Review";
  if (score >= 50) return "Needs careful review";
  return "High concern";
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

main();
