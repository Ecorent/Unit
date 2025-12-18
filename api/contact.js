import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { name, email, phone, message, website } = req.body;

  // Honeypot protection
  if (website) {
    return res.status(200).end();
  }

  try {
    await resend.emails.send({
      from: 'Ecorent Contact <onboarding@resend.dev>',
      to: ['emmirongolo0804@gmail.com'],
      subject: 'New Contact Form Inquiry',
      html: `
        <h2>New Inquiry</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    });

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Email failed' });
  }
}
