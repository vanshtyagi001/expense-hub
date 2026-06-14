import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';

// Reusing VITE_SUPABASE variables works on the server too if they are exposed in process.env, 
// but often we need to explicitly load them. For now, since they are NEXT_PUBLIC variables in the 
// user's prompt, we'll try to pick them up from process.env or fallback (in case it's set in shell).
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sazuncuyunuusfvnhekl.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_vE4ODP1xkOhf5ALFWW2ySw_dZJ92pPL';

const supabase = createClient(supabaseUrl, supabaseKey);

export interface AuthRequest extends Request {
  user?: any;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing token' });
    return;
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      res.status(401).json({ error: 'Unauthorized: Invalid token' });
      return;
    }
    // mapped to look like the decoded firebase token for compatibility
    req.user = {
       uid: user.id,
       email: user.email,
       ...user
    };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
    return;
  }
};
