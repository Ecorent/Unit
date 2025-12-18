export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const formData = await req.formData();

  // Honeypot protection
  if (formData.get('website')) {
    return res.status(200).end();
  }

  const name = formData.get('name');
  const email = formData.get('email');
  const phone = formData.get('phone');
  const message = formData.get('message');

  // TEMP: log to Vercel (works now)
  console.log({
    name,
    email,
    phone,
    message
  });

  return res.status(200).json({ success: true });
}
