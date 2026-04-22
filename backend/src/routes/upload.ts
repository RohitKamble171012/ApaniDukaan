import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { uploadImage } from '../middleware/upload';

const router = Router();

// POST /api/upload/image - Generic image upload
router.post('/image', authenticate, uploadImage.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const url = `/uploads/images/${req.file.filename}`;
    return res.json({ url, filename: req.file.filename });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
