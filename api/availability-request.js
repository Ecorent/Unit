import { Resend } from "resend";
import { canUseLocalSample, SAMPLE_UNIT_SLUG, sampleUnit } from "./_sampleUnit.js";
import { calculateNightlyQuote, isNightly } from "../public/js/pricing.js";

const recipients = [
  "emmanuelhenao0816@gmail.com",
  "ecorentusa@gmail.com"
];
const SANITY_PROJECT_ID = "uxragbo5";
const SANITY_DATASET = "production";
const SANITY_API_VERSION = "2023-10-01";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const request = req.body || {};
  if (
    !request.slug ||
    !request.checkIn ||
    !request.checkOut ||
    !request.fullName ||
    !request.dateOfBirth ||
    !request.phone ||
    !request.email ||
    !request.preferredContact
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (request.preferredContact === "Other" && !request.preferredContactOther) {
    return res.status(400).json({ error: "Missing other contact method" });
  }

  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("Availability request email is not configured: missing RESEND_API_KEY");
      return res.status(503).json({ error: "Email service is not configured" });
    }

    const unit = await loadUnit(request.slug);
    if (!unit || !isNightly(unit)) {
      return res.status(400).json({ error: "Nightly unit not found" });
    }

    const quote = calculateNightlyQuote(unit.seasonalRates, request.checkIn, request.checkOut);
    if (quote.error) {
      return res.status(400).json({ error: "Selected dates do not have a valid nightly rate" });
    }

    const unitName = unit.title?.en || request.unitName || "Selected property";
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: "ECOrent Availability <contact@ecorentusa.com>",
      to: recipients,
      reply_to: request.email,
      subject: `Nightly Availability Request - ${unitName} - ${request.fullName}`,
      html: buildAvailabilityEmail({ ...request, unitName }, quote)
    });

    if (error) {
      console.error("Availability request email failed:", error);
      return res.status(502).json({ error: "Unable to send availability request" });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Availability request failed:", error);
    return res.status(500).json({ error: "Unable to send availability request" });
  }
}

async function loadUnit(slug) {
  if (slug === SAMPLE_UNIT_SLUG && canUseLocalSample()) return sampleUnit;

  const query = `
    *[_type == "unit" && slug.current == $slug][0]{
      title{en, es},
      "pricingType": coalesce(pricingType, "monthly"),
      seasonalRates[]{startDate, endDate, nightlyRate}
    }
  `;
  const params = new URLSearchParams({ query });
  params.set("$slug", JSON.stringify(slug));
  const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}?${params}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Sanity request failed with ${response.status}`);
  const data = await response.json();
  return data.result || null;
}

function buildAvailabilityEmail(request, quote) {
  const currency = value => Number(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });

  return `
    <div style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 720px; color: #292929; border: 1px solid #e1e1e1; border-radius: 6px; overflow: hidden; margin: 0 auto;">
      <div style="background-color: #1f9c53; padding: 20px; color: white;">
        <h2 style="margin: 0; font-size: 20px;">New Nightly Availability Request</h2>
      </div>
      <div style="padding: 24px; background: #fff; line-height: 1.6;">
        <h3 style="color: #12793d; border-bottom: 2px solid #f1f1f1; padding-bottom: 8px;">Requested stay</h3>
        ${emailRow("Property", request.unitName)}
        ${emailRow("Slug", request.slug)}
        ${emailRow("Check-in", request.checkIn)}
        ${emailRow("Checkout", request.checkOut)}
        ${emailRow("Nights", quote.nights)}
        ${emailRow("Estimated nightly total", currency(quote.total))}

        <h3 style="margin-top: 24px; color: #12793d; border-bottom: 2px solid #f1f1f1; padding-bottom: 8px;">Guest information</h3>
        ${emailRow("Full legal name", request.fullName)}
        ${emailRow("Date of birth", request.dateOfBirth)}
        ${emailRow("Phone", request.phone)}
        ${emailRow("Email", request.email)}
        ${emailRow("Preferred contact", request.preferredContact)}
        ${emailRow("Contact details", request.preferredContactOther || "N/A")}
        ${emailRow("Additional questions or requests", request.additionalQuestions || "None provided")}

        <p style="margin: 24px 0 0; padding: 12px; background: #f7faf8; color: #5d665f; font-size: 13px;">
          This is an availability request only. The dates are not confirmed or held automatically.
        </p>
      </div>
    </div>
  `;
}

function emailRow(label, value) {
  return `<p style="margin: 8px 0;"><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
