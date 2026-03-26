import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { bookingService } from '../services/booking.service';

export const bookingController = {
  // Public: create booking
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await bookingService.create(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  // Auth: list bookings
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await bookingService.list(req.userId!, {
        status: req.query.status as string,
        from: req.query.from as string,
        to: req.query.to as string,
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const booking = await bookingService.getById(String(req.params.id), req.userId!);
      res.json(booking);
    } catch (error) {
      next(error);
    }
  },

  async cancel(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const booking = await bookingService.cancel(String(req.params.id), req.userId!, req.body.reason);
      res.json(booking);
    } catch (error) {
      next(error);
    }
  },

  async reschedule(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const booking = await bookingService.reschedule(
        String(req.params.id),
        req.userId!,
        req.body.newStartTime
      );
      res.json(booking);
    } catch (error) {
      next(error);
    }
  },
};
