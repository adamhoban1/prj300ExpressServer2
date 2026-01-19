import express, {Router} from 'express';
import { getReports, getReportById, createReport, updateReport, deleteReport } from '../controllers/Report';
import { validate } from '../middleware/validate.middleware';
import { createReportSchema, updateReportSchema } from '../models/Report';
import { sendPushNotification } from "../services/push.service";


const router: Router = express.Router();

router.get('/', getReports);
router.get('/:id', getReportById);
router.post('/', validate(createReportSchema), createReport);
router.put('/:id', validate(updateReportSchema), updateReport);
router.delete('/:id', deleteReport);
router.post("/test-push", async (req, res) => {
  const { token } = req.body;

  await sendPushNotification(
    [token],
    "Test Alert 🚨",
    "Push notifications are working!"
  );

  res.json({ message: "Notification sent" });
});
export default router;