import { Request, Response, NextFunction } from 'express';
import { getUser } from './supabase';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: any; // Supabase user type
    }
  }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await getUser(req);

    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
};
