import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { registerSchema, loginSchema, updateProfileSchema } from '../validations/auth.validation';
import { generateToken, AuthenticatedRequest } from '../middlewares/auth.middleware';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = registerSchema.parse(req.body);

    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'A user with this email already exists.',
      });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(validatedData.password, salt);

    const user = await User.create({
      name: validatedData.name,
      email: validatedData.email,
      passwordHash,
      role: validatedData.role || 'customer',
      storeName: validatedData.storeName,
      storeDescription: validatedData.storeDescription,
    });

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: {
        user,
        token,
      },
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors,
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const user = await User.findOne({ email: validatedData.email });
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    const isMatch = await bcrypt.compare(validatedData.password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user,
        token,
      },
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors,
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  res.clearCookie('token');
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const validatedData = updateProfileSchema.parse(req.body);
    const updatedUser = await User.findByIdAndUpdate(req.user.userId, validatedData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: { user: updatedUser },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name, avatar, googleId } = req.body;

    if (!email) {
      res.status(400).json({ success: false, message: 'Google email is required' });
      return;
    }

    let user = await User.findOne({ email });

    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const dummyPassword = await bcrypt.hash(`google_${googleId || Date.now()}_secret`, salt);

      user = await User.create({
        name: name || email.split('@')[0],
        email,
        passwordHash: dummyPassword,
        avatar: avatar || '',
        isEmailVerified: true,
        role: 'customer',
      });
    }

    const token = generateToken({
      userId: user._id.toString(),
      _id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: 'Google login successful',
      data: { user, token },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to authenticate with Google',
    });
  }
};

export const githubAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.body;

    if (!code) {
      res.status(400).json({ success: false, message: 'Authorization code is required' });
      return;
    }

    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = (await tokenResponse.json()) as any;
    if (!tokenData.access_token) {
      throw new Error(tokenData.error_description || 'Failed to exchange GitHub code');
    }

    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: 'application/json',
      },
    });

    const ghUser = (await userResponse.json()) as any;
    let email = ghUser.email;

    if (!email) {
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          Accept: 'application/json',
        },
      });
      const emails = (await emailResponse.json()) as any[];
      const primaryEmail = emails.find((e) => e.primary);
      email = primaryEmail ? primaryEmail.email : `${ghUser.login}@github.users.shopnexus.com`;
    }

    let user = await User.findOne({ email });

    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const dummyPassword = await bcrypt.hash(`github_${ghUser.id}_secret`, salt);

      user = await User.create({
        name: ghUser.name || ghUser.login,
        email,
        passwordHash: dummyPassword,
        avatar: ghUser.avatar_url || '',
        isEmailVerified: true,
        role: 'customer',
      });
    }

    const token = generateToken({
      userId: user._id.toString(),
      _id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: 'GitHub login successful',
      data: { user, token },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to authenticate with GitHub',
    });
  }
};
