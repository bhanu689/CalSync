import { Router } from 'express';
import { availabilityController } from '../controllers/availability.controller';
import { slotsController } from '../controllers/slots.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createAvailabilitySchema, updateAvailabilitySchema } from '../validators/availability.validator';

const router = Router();

// Public: get available slots
router.get('/slots', slotsController.getSlots);

// Authenticated routes
router.get('/', authenticate, availabilityController.list);
router.post('/', authenticate, validate(createAvailabilitySchema), availabilityController.create);
router.patch('/:id', authenticate, validate(updateAvailabilitySchema), availabilityController.update);
router.delete('/:id', authenticate, availabilityController.delete);

export default router;
