export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // To securely hit EmailJS without frontend keys, we hit their REST API from the server
  // User asked for EMAIL_API_KEY in .env, so we'll pass it as user_id or accessToken
  const payload = {
    service_id: process.env.EMAILJS_SERVICE_ID || "service_3rnk76r",
    template_id: process.env.EMAILJS_TEMPLATE_ID || "template_4519p5r",
    user_id: process.env.EMAIL_API_KEY || "pQnzlnAMoWVOM5DTk",
    template_params: {
      name: name,
      email: email,
      time: new Date().toLocaleString(),
      message: message,
    }
  };

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Origin': 'https://shivansh-ai-forge.vercel.app'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      return res.status(200).json({ success: true });
    } else {
      const errorText = await response.text();
      return res.status(500).json({ success: false, message: errorText });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
