import { Router } from 'express';
import { eventTypeController } from '../controllers/eventType.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createEventTypeSchema, updateEventTypeSchema } from '../validators/eventType.validator';

const router = Router();

router.use(authenticate);

router.get('/', eventTypeController.list);
router.post('/', validate(createEventTypeSchema), eventTypeController.create);
router.get('/:id', eventTypeController.getById);
router.patch('/:id', validate(updateEventTypeSchema), eventTypeController.update);
router.delete('/:id', eventTypeController.delete);
router.patch('/:id/toggle', eventTypeController.toggle);

export default router;
