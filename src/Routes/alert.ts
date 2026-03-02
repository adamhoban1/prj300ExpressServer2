import express, {Router} from 'express';
import { getReports, getReportById, createReport, updateReport, deleteReport } from '../controllers/Report';
import { validate } from '../middleware/validate.middleware';
import { createReportSchema, updateReportSchema } from '../models/Report';
import { verifyCognitoToken } from '../middleware/cognitoAuth';


const router: Router = express.Router();

router.get('/', getReports);
router.get('/:id', verifyCognitoToken, getReportById);
router.post('/', verifyCognitoToken, validate(createReportSchema), createReport);

//admin and owner can update and delete
router.put('/:id', verifyCognitoToken, validate(updateReportSchema), updateReport);
router.delete('/:id', verifyCognitoToken, deleteReport);
export default router;