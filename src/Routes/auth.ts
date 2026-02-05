import express, {Router} from 'express';
import { validate } from '../middleware/validate.middleware';
import { argon2 } from 'crypto';
import { handleLogin } from '../controllers/auth';

const router: Router = express.Router();

router.post('/', handleLogin);


export default router;