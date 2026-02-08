import express, {Router} from 'express';
import { getReports, getReportById, createReport, updateReport, deleteReport } from '../controllers/Report';
import { validate } from '../middleware/validate.middleware';
import { createReportSchema, updateReportSchema } from '../models/Report';
import { validJWTProvided } from '../middleware/auth.middleware';


const router: Router = express.Router();

router.get('/', getReports);
router.get('/:id', getReportById);
router.post('/', validJWTProvided, validate(createReportSchema), createReport);
router.put('/:id', validJWTProvided, validate(updateReportSchema), updateReport);
router.delete('/:id', validJWTProvided, deleteReport);
export default router;