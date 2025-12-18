import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  console.log("📨 Contact form hit");

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const { error } = await resend.emails.send({
      from: 'ECOrent <onboarding@resend.dev>',
      to: ['emmirongolo0804@gmail.com'],          
      reply_to: email,
      subject: `New Inquiry from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
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
