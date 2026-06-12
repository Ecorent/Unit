import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  console.log("📨 Contact form hit");

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, message, unitTitle } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const { error } = await resend.emails.send({
      from: 'ECOrent <contact@ecorentusa.com>',
      to: [ 
        'emmanuelhenao0816@gmail.com',
        'none@gmail.com'
      ],          
      reply_to: email,
      subject: `📧 New Inquiry — ${unitTitle || 'General'} — from ${name}`,
      html: `
        <div style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 600px; color: #292929; border: 1px solid #e1e1e1; border-radius: 6px; overflow: hidden; margin: 0 auto;">
          <div style="background-color: #1f9c53; padding: 20px; color: white;">
            <h2 style="margin: 0; font-size: 20px; font-weight: 600;">New Contact Form Submission</h2>
          </div>
          
          <div style="padding: 24px; background-color: #ffffff; line-height: 1.6;">
            
            <h3 style="margin-top: 0; color: #12793d; border-bottom: 2px solid #f1f1f1; padding-bottom: 8px;">Inquiry Reference</h3>
            <p style="margin: 8px 0;"><strong>Property Unit:</strong> ${unitTitle || 'General Inquiry'}</p>
            
            <h3 style="margin-top: 24px; color: #12793d; border-bottom: 2px solid #f1f1f1; padding-bottom: 8px;">Prospect Information</h3>
            <p style="margin: 8px 0;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 8px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 8px 0;"><strong>Phone:</strong> ${phone || 'N/A'}</p>
            
            <h3 style="margin-top: 24px; color: #12793d; border-bottom: 2px solid #f1f1f1; padding-bottom: 8px;">Message Details</h3>
            <div style="background-color: #f9f9f9; padding: 16px; border-left: 4px solid #1f9c53; margin-top: 12px; border-radius: 4px;">
              <p style="margin: 0; white-space: pre-wrap; font-size: 0.95rem; color: #333;">${message}</p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e1e1e1; margin-top: 30px;">
            <p style="font-size: 11px; color: #777; margin-bottom: 0; text-align: center;">
              This notification was generated automatically by ECOrentusa.
            </p>
          </div>
        </div>
      `
    });

    if (error) {
      console.error("❌ Resend error:", error);
      return res.status(500).json({ error: 'Email failed to send' });
    }

    console.log("✅ Email sent successfully");
    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("🔥 Server error:", err);
    return res.status(500).json({ error: 'Server error' });
  }
}