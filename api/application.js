import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const recipients = [
  'emmanuelhenao0816@gmail.com',
  'none@gmail.com'
];

const sections = [
  {
    title: 'Applicant Information',
    fields: [
      ['Full Legal Name', 'fullName'],
      ['Date of Birth', 'dateOfBirth'],
      ['Phone Number', 'phone'],
      ['Email Address', 'email'],
      ['Government ID Type & Number', 'governmentId'],
      ['Social Security Number', 'ssn'],
      ['Social Media Links', 'socialMedia']
    ]
  },
  {
    title: 'Occupancy Details',
    fields: [
      ['All Occupants', 'occupants'],
      ['Total Number of Occupants', 'occupantCount']
    ]
  },
  {
    title: 'Current Housing',
    fields: [
      ['Current Address', 'currentAddress'],
      ['Landlord Name & Contact', 'landlordContact'],
      ['Monthly Rent/Mortgage', 'monthlyRent'],
      ['Length of Residency', 'residencyLength'],
      ['Reason for Leaving', 'leavingReason'],
      ['Evicted?', 'evicted'],
      ['Eviction Explanation', 'evictionExplanation'],
      ['Broken Lease?', 'brokenLease'],
      ['Broken Lease Explanation', 'brokenLeaseExplanation']
    ]
  },
  {
    title: 'Employment & Income',
    fields: [
      ['Employer Name', 'employer'],
      ['Job Title', 'jobTitle'],
      ['Length of Employment', 'employmentLength'],
      ['Monthly Gross Income', 'monthlyIncome'],
      ['Other Income', 'otherIncome']
    ]
  },
  {
    title: 'Financial & Background Disclosure',
    fields: [
      ['Credit/Background Notes', 'backgroundNotes'],
      ['Bankruptcy?', 'bankruptcy'],
      ['Bankruptcy Explanation', 'bankruptcyExplanation'],
      ['Criminal Conviction?', 'criminalConviction'],
      ['Conviction Explanation', 'convictionExplanation']
    ]
  },
  {
    title: 'Pet Information',
    fields: [
      ['Pets?', 'pets'],
      ['Type', 'petType'],
      ['Breed', 'petBreed'],
      ['Weight', 'petWeight'],
      ['Number of Pets', 'petCount']
    ]
  },
  {
    title: 'Authorizations',
    fields: [
      ['Screening Authorization', 'screeningAuthorization'],
      ['Screening Signature', 'screeningSignature'],
      ['Screening Date', 'screeningDate'],
      ['Final Acknowledgment', 'acknowledgment'],
      ['Applicant Signature(s)', 'finalSignature'],
      ['Final Date', 'finalDate']
    ]
  }
];

export default async function handler(req, res) {
  console.log("Rental application form hit");

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const application = req.body || {};

  if (!application.fullName || !application.email || !application.phone || !application.finalSignature) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const candidateRank = calculateCandidateRank(application);

    const { error } = await resend.emails.send({
      from: 'ECOrent Applications <contact@ecorentusa.com>',
      to: recipients,
      reply_to: application.email,
      subject: `[Rank ${candidateRank.score}/100] New Rental Application - ${application.unitName || 'Selected apartment'} - ${application.fullName}`,
      html: buildApplicationEmail(application, candidateRank)
    });

    if (error) {
      console.error("Resend error:", error);
      return res.status(500).json({ error: 'Application email failed to send' });
    }

    console.log("Rental application email sent successfully");
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: 'Server error' });
  }
}

function buildApplicationEmail(application, candidateRank) {
  return `
    <div style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 720px; color: #292929; border: 1px solid #e1e1e1; border-radius: 6px; overflow: hidden; margin: 0 auto;">
      <div style="background-color: #1f9c53; padding: 20px; color: white;">
        <h2 style="margin: 0; font-size: 20px; font-weight: 600;">New Rental Application</h2>
      </div>

      <div style="padding: 24px; background-color: #ffffff; line-height: 1.6;">
        <h3 style="margin-top: 0; color: #12793d; border-bottom: 2px solid #f1f1f1; padding-bottom: 8px;">Application Reference</h3>
        <p style="margin: 8px 0;"><strong>Apartment:</strong> ${escapeHtml(application.unitName || 'Selected apartment')}</p>
        <p style="margin: 8px 0;"><strong>Slug:</strong> ${escapeHtml(application.slug || 'N/A')}</p>
        <p style="margin: 8px 0;"><strong>Submitted:</strong> ${escapeHtml(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }))}</p>

        ${renderCandidateRank(candidateRank)}

        ${sections.map(section => renderSection(section, application)).join('')}

        <hr style="border: none; border-top: 1px solid #e1e1e1; margin-top: 30px;">
        <p style="font-size: 11px; color: #777; margin-bottom: 0; text-align: center;">
          This notification was generated automatically by ECOrentusa.
        </p>
      </div>
    </div>
  `;
}

function calculateCandidateRank(application) {
  let score = 100;
  const factors = [];

  const subtract = (points, label) => {
    score -= points;
    factors.push({ points: -points, label });
  };

  const addNote = label => {
    factors.push({ points: 0, label });
  };

  if (isYes(application.evicted)) {
    subtract(18, 'Prior eviction disclosed');
  }

  if (isYes(application.brokenLease)) {
    subtract(15, 'Prior broken lease disclosed');
  }

  if (isYes(application.bankruptcy)) {
    subtract(12, 'Bankruptcy disclosed');
  }

  if (isYes(application.criminalConviction)) {
    subtract(10, 'Criminal conviction disclosed for review');
  }

  if (hasMeaningfulDisclosure(application.backgroundNotes)) {
    subtract(8, 'Additional credit/background notes provided');
  }

  const employmentMonths = parseDurationInMonths(application.employmentLength);
  if (employmentMonths != null) {
    if (employmentMonths < 3) {
      subtract(8, 'Employment length under 3 months');
    } else if (employmentMonths < 12) {
      subtract(4, 'Employment length under 12 months');
    } else {
      addNote('Employment length is 12+ months');
    }
  }

  const monthlyIncome = Number(application.monthlyIncome);
  if (Number.isFinite(monthlyIncome)) {
    if (monthlyIncome < 2000) {
      subtract(8, 'Monthly gross income under $2,000');
    } else if (monthlyIncome < 3000) {
      subtract(4, 'Monthly gross income under $3,000');
    } else {
      addNote('Monthly gross income is $3,000+');
    }
  }

  const occupantCount = Number(application.occupantCount);
  if (Number.isFinite(occupantCount) && occupantCount > 6) {
    subtract(3, 'More than 6 occupants listed');
  }

  const petCount = Number(application.petCount);
  if (Number.isFinite(petCount) && petCount > 2) {
    subtract(2, 'More than 2 pets listed');
  }

  if (!application.screeningAuthorization || !application.acknowledgment) {
    subtract(20, 'Required authorization or acknowledgment missing');
  }

  const finalScore = Math.min(100, Math.max(1, Math.round(score)));
  const band = finalScore >= 85
    ? 'Strong'
    : finalScore >= 70
      ? 'Review'
      : finalScore >= 50
        ? 'Needs careful review'
        : 'High concern';

  return {
    score: finalScore,
    band,
    factors: factors.length ? factors : [{ points: 0, label: 'No scoring deductions from questionnaire responses' }]
  };
}

function renderCandidateRank(candidateRank) {
  const badgeColor = candidateRank.score >= 85
    ? '#1f9c53'
    : candidateRank.score >= 70
      ? '#f2994a'
      : '#d93025';

  return `
    <h3 style="margin-top: 24px; color: #12793d; border-bottom: 2px solid #f1f1f1; padding-bottom: 8px;">Internal Candidate Rank</h3>
    <p style="margin: 8px 0;">
      <strong>Score:</strong>
      <span style="background-color: ${badgeColor}; color: white; padding: 3px 10px; border-radius: 12px; font-weight: bold; font-size: 14px;">${candidateRank.score} / 100</span>
      <span style="color: #5d665f;">${escapeHtml(candidateRank.band)}</span>
    </p>
    <p style="margin: 8px 0; color: #777; font-size: 12px;">
      Internal screening aid only. Do not use as an automatic approval or denial decision.
    </p>
    <ul style="margin-top: 8px; padding-left: 20px;">
      ${candidateRank.factors.map(factor => `
        <li style="margin: 4px 0;">
          ${factor.points ? `<strong>${factor.points}</strong> ` : ''}
          ${escapeHtml(factor.label)}
        </li>
      `).join('')}
    </ul>
  `;
}

function renderSection(section, application) {
  return `
    <h3 style="margin-top: 24px; color: #12793d; border-bottom: 2px solid #f1f1f1; padding-bottom: 8px;">${escapeHtml(section.title)}</h3>
    ${section.fields.map(([label, key]) => `
      <p style="margin: 8px 0;">
        <strong>${escapeHtml(label)}:</strong>
        ${formatValue(application[key])}
      </p>
    `).join('')}
  `;
}

function formatValue(value) {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (value == null || value === '') return 'N/A';
  return escapeHtml(String(value)).replace(/\n/g, '<br>');
}

function isYes(value) {
  return String(value || '').trim().toLowerCase() === 'yes';
}

function hasMeaningfulDisclosure(value) {
  const normalized = String(value || '').trim().toLowerCase();
  return normalized !== '' && normalized !== 'n/a' && normalized !== 'na' && normalized !== 'none' && normalized !== 'no';
}

function parseDurationInMonths(value) {
  const text = String(value || '').toLowerCase();
  const numberMatch = text.match(/(\d+(?:\.\d+)?)/);
  if (!numberMatch) return null;

  const amount = Number(numberMatch[1]);
  if (!Number.isFinite(amount)) return null;

  if (text.includes('year') || text.includes('yr')) return amount * 12;
  if (text.includes('month') || text.includes('mo')) return amount;
  return amount;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
