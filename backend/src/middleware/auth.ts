import { Request, Response, NextFunction } from 'express';
import { verifyFirebaseToken } from '../utils/firebase';
import User from '../models/User';

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email: string;
    shopId?: string;
  };
}

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No authorization token provided' });
      return;
    }

    const token = authHeader.split('Bearer ')[1];
    const decoded = await verifyFirebaseToken(token);

    const user = await User.findOne({ firebaseUid: decoded.uid });
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    req.user = {
      uid: decoded.uid,
      email: decoded.email || '',
      shopId: user.shopId?.toString()
    };

    next();
  } catch (error: any) {
    if (error.code === 'auth/id-token-expired') {
      res.status(401).json({ error: 'Token expired. Please re-login.' });
    } else {
      res.status(401).json({ error: 'Invalid token' });
    }
  }
}

export async function requireShop(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.user?.shopId) {
    res.status(403).json({ error: 'Shop not found. Please complete onboarding.' });
    return;
  }
  next();
}
