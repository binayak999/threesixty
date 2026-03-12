import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User';

const router = Router();

router.post('/sign-in', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required.' });
      return;
    }

    const user = await User.findOne({ email: String(email).trim().toLowerCase() })
      .select('+passwordHash')
      .lean();

    if (!user || !user.passwordHash) {
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    const match = await bcrypt.compare(String(password), user.passwordHash);
    if (!match) {
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    res.status(200).json({
      user: {
        id: String(user._id),
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Sign-in error:', err);
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
});

export default router;
