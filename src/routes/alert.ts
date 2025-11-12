import express, {Router} from 'express';
import { getAlerts, getalertById, createalert, updatealert, deletealert } from '../controllers/alert';
import { validate } from '../middleware/validate.middleware';
import { createalertSchema, updatealertSchema } from '../models/alert';


const router: Router = express.Router();

router.get('/', getAlerts);
router.get('/:id', getalertById);
router.post('/', validate(createalertSchema), createalert);
router.put('/:id', validate(updatealertSchema), updatealert);
router.delete('/:id', deletealert);

export default router;