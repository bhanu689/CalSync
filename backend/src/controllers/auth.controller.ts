import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { env } from '../config/env';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'none' as const : 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);
      res.status(201).json({ accessToken: result.accessToken, user: result.user });
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);
      res.status(200).json({ accessToken: result.accessToken, user: result.user });
    } catch (error) {
      next(error);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies?.refreshToken;
      if (!token) {
        res.status(401).json({
          error: { code: 'UNAUTHORIZED', message: 'Refresh token required' },
        });
        return;
      }
      const result = await authService.refresh(token);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await authService.logout(req.userId!);
      res.clearCookie('refreshToken', { path: '/' });
      res.status(200).json({ message: 'Logged out' });
    } catch (error) {
      next(error);
    }
  },

  async getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await authService.getMe(req.userId!);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  },

  async updateMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await authService.updateProfile(req.userId!, req.body);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  },
};
