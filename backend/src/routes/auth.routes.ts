import { Router, Request, Response } from 'express';
import passport from 'passport';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { registerSchema, loginSchema, updateProfileSchema } from '../validators/auth.validator';
import { signAccessToken, signRefreshToken } from '../utils/jwt';
import { IUser } from '../models/User';
import { env } from '../config/env';

const router = Router();

// Email/Password
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);
router.patch('/me', authenticate, validate(updateProfileSchema), authController.updateMe);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${env.FRONTEND_URL}/login` }),
  (req: Request, res: Response) => {
    const user = req.user as IUser;
    const accessToken = signAccessToken({ userId: String(user._id), email: user.email });
    const refreshToken = signRefreshToken({ userId: String(user._id), version: user.refreshTokenVersion });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    res.redirect(`${env.FRONTEND_URL}/dashboard?token=${accessToken}`);
  }
);

export default router;
