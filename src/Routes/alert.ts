import express, {Router} from 'express';
import { getReports, getReportById, createReport, updateReport, deleteReport } from '../controllers/Report';
import { validate } from '../middleware/validate.middleware';
import { createReportSchema, updateReportSchema } from '../models/Report';


const router: Router = express.Router();

router.get('/', getReports);
router.get('/:id', getReportById);
router.post('/', validate(createReportSchema), createReport);
router.put('/:id', validate(updateReportSchema), updateReport);
router.delete('/:id', deleteReport);
export default router;