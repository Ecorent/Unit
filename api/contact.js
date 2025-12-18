export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { name, email, phone, message, website } = req.body;

  // Honeypot protection
  if (website) {
    return res.status(200).end();
  }

  // TEMP: Log submissions (visible in Vercel logs)
  console.log({
    name,
    email,
    phone,
    message
  });

  return res.status(200).json({ success: true });
}
