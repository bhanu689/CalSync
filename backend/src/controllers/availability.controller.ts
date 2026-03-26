import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { availabilityService } from '../services/availability.service';

export const availabilityController = {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const availabilities = await availabilityService.list(req.userId!);
      res.json({ availabilities });
    } catch (error) {
      next(error);
    }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const availability = await availabilityService.create(req.userId!, req.body);
      res.status(201).json(availability);
    } catch (error) {
      next(error);
    }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const availability = await availabilityService.update(
        String(req.params.id),
        req.userId!,
        req.body
      );
      res.json(availability);
    } catch (error) {
      next(error);
    }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await availabilityService.delete(String(req.params.id), req.userId!);
      res.json({ message: 'Availability deleted' });
    } catch (error) {
      next(error);
    }
  },
};
