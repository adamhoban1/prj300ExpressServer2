import express, {Router} from 'express';
import { getAlerts, getalertById, createalert, updatealert, deletealert } from '../controllers/alert';


const router: Router = express.Router();

router.get('/', getAlerts);
router.get('/:id', getalertById);
router.post('/', createalert);
router.put('/:id', updatealert);
router.delete('/:id', deletealert);

export default router;