import { Router } from 'express';
import { bookingController } from '../controllers/booking.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createBookingSchema, cancelBookingSchema, rescheduleBookingSchema } from '../validators/booking.validator';

const router = Router();

// Public: create booking
router.post('/', validate(createBookingSchema), bookingController.create);

// Authenticated routes
router.get('/', authenticate, bookingController.list);
router.get('/:id', authenticate, bookingController.getById);
router.patch('/:id/cancel', authenticate, validate(cancelBookingSchema), bookingController.cancel);
router.patch('/:id/reschedule', authenticate, validate(rescheduleBookingSchema), bookingController.reschedule);

export default router;
