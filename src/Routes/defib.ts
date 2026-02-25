import express, {Router} from 'express';
import { createDefib, deleteDefib, getDefibById, getDefibs, updateDefib } from '../controllers/defib';
import { validate } from '../middleware/validate.middleware';
import { createDefibSchema, updateDefibSchema } from '../models/defib';


const router: Router = express.Router();

router.get('/', getDefibs);
router.get('/:id', getDefibById);
router.post('/', validate(createDefibSchema), createDefib);
router.put('/:id', validate(updateDefibSchema), updateDefib);
router.delete('/:id', deleteDefib);
export default router;