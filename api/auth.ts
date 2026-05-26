import { getAdminPassword, getAdminUsername } from "./_lib/config";

// In standard Vercel serverless functions, we use standard request/response
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { type, username, password } = req.body;

  // Type can be 'blog', 'secret', or 'admin'
  let role = null;

  const adminPassword = getAdminPassword();
  const adminUsername = getAdminUsername();

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
    
    // Custom .env password verifies Super Admin status dynamic reflection
    const isSuper = (username === adminUsername && password === adminPassword) || (password === adminPassword && !adminUsername);
    
    return res.status(200).json({ success: true, role, token, isSuperAdmin: isSuper });
  }

  return res.status(401).json({ success: false, message: 'Invalid credentials' });
}
