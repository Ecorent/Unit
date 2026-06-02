import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  console.log("🛠️ Maintenance form hit");

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    tenantName,
    tenantPhone,
    tenantEmail,
    propertyAddress,
    unitNumber,
    issueDescription,
    startDate,
    permissionToEnter,
    bestTime,
    waterIssue,
    petsPresent,
    urgencyRating, // 🔟 Added to capture payload from maintenance.js
    acknowledged
  } = req.body;

  // Validate critical fields (including urgency profile status validation rules)
  if (!tenantName || !tenantEmail || !propertyAddress || !issueDescription || !startDate || !urgencyRating) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  // Determine a color metric state for the email alert pill based on priority numbers
  const priorityInt = parseInt(urgencyRating, 10);
  let badgeColor = '#1f9c53'; // Default green (1-4)
  if (priorityInt >= 5 && priorityInt <= 7) badgeColor = '#f2994a'; // Orange warning (5-7)
  if (priorityInt >= 8) badgeColor = '#d93025'; // Red critical hazard level (8-10)

  try {
    const { error } = await resend.emails.send({
      from: 'ECOrent Maintenance <contact@ecorentusa.com>',
      to: [ 
        'emmanuelhenao0816@gmail.com',
        'ecorentusa@gmail.com'
      ],          
      reply_to: tenantEmail,
      subject: `🛠️ [Priority ${urgencyRating}/10] Maintenance Request: ${propertyAddress} ${unitNumber ? `#${unitNumber}` : ''} — ${tenantName}`,
      html: `
        <div style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 600px; color: #292929; border: 1px solid #e1e1e1; border-radius: 6px; overflow: hidden;">
          <div style="background-color: #1f9c53; padding: 20px; color: white; display: flex; justify-content: space-between; align-items: center;">
            <h2 style="margin: 0; font-size: 20px;">New Maintenance Request</h2>
          </div>
          
          <div style="padding: 24px; background-color: #ffffff; line-height: 1.6;">
            <h3 style="margin-top: 0; color: #12793d; border-bottom: 2px solid #f1f1f1; padding-bottom: 8px;">Tenant Info</h3>
            <p><strong>Name:</strong> ${tenantName}</p>
            <p><strong>Email:</strong> ${tenantEmail}</p>
            <p><strong>Phone:</strong> ${tenantPhone}</p>
            
            <h3 style="margin-top: 24px; color: #12793d; border-bottom: 2px solid #f1f1f1; padding-bottom: 8px;">Location</h3>
            <p><strong>Address:</strong> ${propertyAddress}</p>
            <p><strong>Unit/Apt:</strong> ${unitNumber || 'N/A'}</p>
            
            <h3 style="margin-top: 24px; color: #12793d; border-bottom: 2px solid #f1f1f1; padding-bottom: 8px;">Issue Details</h3>
            <p><strong>When did it start?:</strong> ${startDate}</p>
            <p><strong>Urgency Level:</strong> <span style="background-color: ${badgeColor}; color: white; padding: 3px 10px; border-radius: 12px; font-weight: bold; font-size: 14px;">${urgencyRating} / 10</span></p>
            <p><strong>Involves water/leak?:</strong> <span style="color: ${waterIssue === 'Yes' ? '#d93025' : '#292929'}; font-weight: bold;">${waterIssue}</span></p>
            <p><strong>Are there pets present?:</strong> ${petsPresent}</p>
            
            <div style="background-color: #f9f9f9; padding: 16px; border-left: 4px solid #1f9c53; margin: 16px 0; border-radius: 4px;">
              <p style="margin: 0;"><strong>Description of the issue:</strong></p>
              <p style="margin: 8px 0 0 0; white-space: pre-wrap;">${issueDescription}</p>
            </div>

            <h3 style="margin-top: 24px; color: #12793d; border-bottom: 2px solid #f1f1f1; padding-bottom: 8px;">Scheduling Preferences</h3>
            <p><strong>Permission to enter if absent?:</strong> <strong>${permissionToEnter}</strong></p>
            <p><strong>Best times to visit:</strong> ${bestTime}</p>
            
            <hr style="border: none; border-top: 1px solid #e1e1e1; margin-top: 30px;">
            <p style="font-size: 11px; color: #777; margin-bottom: 0;">
              Tenant Acknowledgment: ${acknowledged ? "✓ Agreed to 24-72 hour response time parameters based on urgency metrics." : "✗ Not marked"}
            </p>
          </div>
        </div>
      `
    });

    if (error) {
      console.error("❌ Resend error:", error);
      return res.status(500).json({ error: 'Email delivery pipeline malfunctioned' });
    }

    console.log("✅ Maintenance request email dispatched successfully");
    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("🔥 Internal Server Failure:", err);
    return res.status(500).json({ error: 'Internal server error encountered' });
  }
}