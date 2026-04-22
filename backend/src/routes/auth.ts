import { Router, Request, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import User from '../models/User';
import Shop from '../models/Shop';

const router = Router();

// POST /api/auth/register - Register or login shopkeeper after Firebase auth
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { firebaseUid, email, displayName, photoURL } = req.body;

    if (!firebaseUid || !email) {
      return res.status(400).json({ error: 'firebaseUid and email are required' });
    }

    let user = await User.findOne({ firebaseUid });

    if (!user) {
      user = await User.create({ firebaseUid, email, displayName: displayName || email.split('@')[0], photoURL });
    } else {
      // Update display name if changed
      if (displayName && user.displayName !== displayName) {
        user.displayName = displayName;
        await user.save();
      }
    }

    return res.json({
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        shopId: user.shopId,
        onboardingComplete: user.onboardingComplete
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me - Get current user profile
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user!.uid });
    if (!user) return res.status(404).json({ error: 'User not found' });

    let shop = null;
    if (user.shopId) {
      shop = await Shop.findById(user.shopId).select('-__v');
    }

    return res.json({
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        shopId: user.shopId,
        onboardingComplete: user.onboardingComplete
      },
      shop
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
