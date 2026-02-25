import express, { Router } from 'express';
import { validate } from '../middleware/validate.middleware';
import { verifyCognitoToken } from '../middleware/cognitoAuth';
import { createUserSchema, updateUserSchema } from '../models/user';
import {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
} from '../controllers/users';
import {
    syncCognitoUser,
    getCurrentUserProfile,
    updateCurrentUserProfile
} from '../controllers/users';

const router: Router = express.Router();

router.post('/cognito/sync', verifyCognitoToken, syncCognitoUser);// Endpoint to sync Cognito user data with our database
router.get('/cognito/me', verifyCognitoToken, getCurrentUserProfile);// Endpoint to get the current user's profile based on the Cognito token
router.put('/cognito/me', verifyCognitoToken, updateCurrentUserProfile);// Endpoint to update the current user's profile based on the Cognito token

router.get('/', getUsers);// These are below the Cognito-specific routes to provent any conflicts with link thinkiing /cognito is a user ID
router.get('/:id', getUserById);
router.post('/', validate(createUserSchema), createUser);
router.put('/:id', validate(updateUserSchema), updateUser);
router.delete('/:id', deleteUser);

export default router;