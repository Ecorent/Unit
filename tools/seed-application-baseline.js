const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const firebaseConfig = {
  apiKey: "AIzaSyBxeT7J01HowUGiIG-pXie7zb-wgyZkTNk",
  projectId: "ecorent-203b2"
};

const inputPath = path.resolve(__dirname, "..", "imports", "applications", "applications-import.json");
const firestoreBaseUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents`;

async function main() {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Parsed import file not found: ${inputPath}`);
  }

  const parsed = JSON.parse(fs.readFileSync(inputPath, "utf8"));
  const applications = Array.isArray(parsed.applications) ? parsed.applications : [];

  if (!applications.length) {
    throw new Error("No applications found in parsed import file.");
  }

  let imported = 0;

  for (const application of applications) {
    const documentId = getDocumentId(application);
    const url = `${firestoreBaseUrl}/applications/${documentId}?key=${firebaseConfig.apiKey}`;
    const response = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields: toFirestoreFields(normalizeApplication(application)) })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Firestore write failed for ${application.applicantName || documentId}: ${response.status} ${errorBody}`);
    }

    imported += 1;
  }

  console.log(`Seeded ${imported} baseline application(s) into Firestore.`);
}

function normalizeApplication(application) {
  const submittedDate = application.submittedAtClient ? new Date(application.submittedAtClient) : new Date();

  return {
    ...application,
    applicantName: application.applicantName || application.fullName || "",
    applicantEmail: application.applicantEmail || application.email || "",
    applicantPhone: application.applicantPhone || application.phone || "",
    unitName: application.unitName || "Selected apartment",
    rankingScore: Number(application.rankingScore) || 0,
    rankingBand: application.rankingBand || "Review",
    status: normalizeStatus(application.status),
    submittedAt: Number.isNaN(submittedDate.getTime()) ? new Date().toISOString() : submittedDate.toISOString(),
    importedAt: new Date().toISOString()
  };
}

function toFirestoreFields(value) {
  return Object.entries(value).reduce((fields, [key, fieldValue]) => {
    if (fieldValue === undefined) return fields;
    fields[key] = toFirestoreValue(fieldValue);
    return fields;
  }, {});
}

function toFirestoreValue(value) {
  if (value === null) return { nullValue: null };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number" && Number.isInteger(value)) return { integerValue: String(value) };
  if (typeof value === "number") return { doubleValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(toFirestoreValue) } };

  if (value instanceof Date) {
    return { timestampValue: value.toISOString() };
  }

  if (typeof value === "object") {
    return { mapValue: { fields: toFirestoreFields(value) } };
  }

  if (isIsoDateField(value)) {
    return { timestampValue: value };
  }

  return { stringValue: String(value) };
}

function isIsoDateField(value) {
  if (typeof value !== "string") return false;
  if (!/^\d{4}-\d{2}-\d{2}T/.test(value)) return false;
  return !Number.isNaN(new Date(value).getTime());
}

function getDocumentId(application) {
  const key = application.importKey || [
    application.applicantName,
    application.applicantEmail,
    application.submittedAtClient,
    application.unitName
  ].join("|");

  return `baseline-${crypto.createHash("sha256").update(key).digest("hex").slice(0, 24)}`;
}

function normalizeStatus(status) {
  return ["New", "Reviewing", "Approved", "Denied"].includes(status) ? status : "New";
}

main().catch(error => {
  console.error(error.message);
  process.exit(1);
});
