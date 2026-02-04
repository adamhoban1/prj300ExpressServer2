import express, {Router} from 'express';
import { validate } from '../middleware/validate.middleware';
import { createUserSchema, updateUserSchema } from '../models/user';
import {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
} from '../controllers/users';
import { validJWTProvided } from '../middleware/auth.middleware';

const router: Router = express.Router();

router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/',validate(createUserSchema), createUser);
router.put('/:id',validate(updateUserSchema), updateUser);
router.delete('/:id',validJWTProvided, deleteUser);

export default router;
