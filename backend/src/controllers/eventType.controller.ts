import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { eventTypeService } from '../services/eventType.service';

export const eventTypeController = {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const eventTypes = await eventTypeService.list(req.userId!);
      res.json({ eventTypes });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const eventType = await eventTypeService.getById(String(req.params.id), req.userId!);
      res.json(eventType);
    } catch (error) {
      next(error);
    }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const eventType = await eventTypeService.create(req.userId!, req.body);
      res.status(201).json(eventType);
    } catch (error) {
      next(error);
    }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const eventType = await eventTypeService.update(String(req.params.id), req.userId!, req.body);
      res.json(eventType);
    } catch (error) {
      next(error);
    }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await eventTypeService.delete(String(req.params.id), req.userId!);
      res.json({ message: 'Event type deleted' });
    } catch (error) {
      next(error);
    }
  },

  async toggle(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const eventType = await eventTypeService.toggle(String(req.params.id), req.userId!);
      res.json(eventType);
    } catch (error) {
      next(error);
    }
  },
};
