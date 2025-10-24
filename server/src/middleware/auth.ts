import type { Request, Response, NextFunction } from 'express';
import { createUserSupabaseClient } from '../config/supabase';

export interface AuthUser {
  id: string;
  email?: string;
  role: 'admin' | 'user';
  raw: any;
}

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthUser;
      accessToken?: string;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
  if (!token) return res.status(401).json({ error: 'Missing Bearer token' });

  const supabase = createUserSupabaseClient(token);
  supabase.auth.getUser().then(({ data, error }) => {
    if (error || !data?.user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    const appRole = (data.user.app_metadata?.role as string) || 'user';
    req.authUser = {
      id: data.user.id,
      email: data.user.email ?? undefined,
      role: appRole === 'admin' ? 'admin' : 'user',
      raw: data.user,
    };
    req.accessToken = token;
    next();
  }).catch((e) => {
    return res.status(500).json({ error: 'Auth verification failed', details: String(e) });
  });
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.authUser) return res.status(401).json({ error: 'Unauthenticated' });
  if (req.authUser.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  next();
}
