import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { EventType } from '../models/EventType';
import { AppError } from '../middleware/error.middleware';

export const userController = {
  async getPublicProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const username = String(req.params.username).toLowerCase();
      const user = await User.findOne({ username });

      if (!user) {
        throw new AppError(404, 'NOT_FOUND', 'User not found');
      }

      const eventTypes = await EventType.find({ userId: user._id, isActive: true })
        .select('title slug description durationMinutes type color')
        .sort({ createdAt: 1 });

      res.json({
        user: {
          name: user.name,
          username: user.username,
          avatar: user.avatar || null,
        },
        eventTypes: eventTypes.map((et) => ({
          id: et._id,
          title: et.title,
          slug: et.slug,
          description: et.description,
          durationMinutes: et.durationMinutes,
          type: et.type,
          color: et.color,
        })),
      });
    } catch (error) {
      next(error);
    }
  },
};
