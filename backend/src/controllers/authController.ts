import { Request, Response } from 'express';
import User from '../models/user';

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, role = 'user' } = req.body;
    console.log('Signup attempt:', { name, email, phone, role });
    const user = new User({ name, email, password, phone, role });
    await user.save();
    res.status(201).json({
      message: 'User registered successfully',
      user: { name: user.name, email: user.email, role: user.role },
    });
  } catch (error: any) {
    console.error('Signup error:', error.message);
    if (error.code === 11000) {
      res.status(400).json({ error: 'Email already in use' });
    } else {
      res.status(500).json({ error: 'Error registering user', details: error.message });
    }
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Login attempt:', req.body);
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: 'Error logging in', details: error.message });
  }
};