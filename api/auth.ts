import type { ViteDevServer } from 'vite';

// In standard Vercel serverless functions, we use standard request/response
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { type, username, password } = req.body;

  // Type can be 'blog', 'secret', or 'admin'
  let role = null;

  const adminPassword = process.env.ADMIN_PASSWORD?.trim();
  const adminUsername = process.env.ADMIN_USERNAME?.trim();

  // Validate credentials strictly against the single unified ADMIN_PASSWORD
  let isAuthenticated = false;

  if (adminPassword && password === adminPassword) {
    isAuthenticated = true;
  } else if (adminUsername && adminPassword && username === adminUsername && password === adminPassword) {
    isAuthenticated = true;
  }

  if (isAuthenticated) {
    // Preserve requested role/type to maintain frontend RBAC and UI features
    role = type;
  }

  if (role) {
    // Generate a simple token (a basic base64 encoded JSON for this simple usecase, 
    // ideally signed with a standard JWT in heavy production, 
    // but the actual protection is in the frontend gate keeping)
    const token = Buffer.from(JSON.stringify({ role, exp: Date.now() + 86400000 })).toString('base64');
    
    return res.status(200).json({ success: true, role, token });
  }

  return res.status(401).json({ success: false, message: 'Invalid credentials' });
}
