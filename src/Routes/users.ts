// routes/auth.ts
import express, { Router, Response } from 'express';
import { verifyCognitoToken, AuthRequest } from '../middleware/cognitoAuth';
import { collections } from '../database'; // Your existing database file
import { User } from '../models/user';

const router: Router = express.Router();

// Sync user from Cognito to MongoDB
router.post('/sync', verifyCognitoToken, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const cognitoId = req.user?.sub;
        const email = req.user?.email;
        const cognitoUsername = req.user?.['cognito:username'];

        if (!cognitoId || !email) {
            res.status(400).json({ error: 'Missing user information from Cognito token' });
            return;
        }

        if (!collections.users) {
            res.status(500).json({ error: 'Database not initialized' });
            return;
        }

        // Find existing user by cognitoId
        let user = await collections.users.findOne({ cognitoId });

        if (!user) {
            // Create new user in MongoDB
            const newUser: User = {
                cognitoId,
                email,
                username: cognitoUsername || email.split('@')[0],
                phonenumber: '',
                dateJoined: new Date(),
                lastLogin: new Date()
            };

            const result = await collections.users.insertOne(newUser);
            
            res.json({ 
                success: true, 
                user: { ...newUser, _id: result.insertedId },
                isNewUser: true
            });
        } else {
            // Update existing user's last login
            await collections.users.updateOne(
                { cognitoId },
                { 
                    $set: { 
                        lastLogin: new Date(),
                        email
                    } 
                }
            );

            res.json({ 
                success: true, 
                user,
                isNewUser: false
            });
        }
    } catch (error) {
        console.error('Sync error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get current authenticated user's profile
router.get('/me', verifyCognitoToken, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const cognitoId = req.user?.sub;

        if (!cognitoId) {
            res.status(400).json({ error: 'Invalid user token' });
            return;
        }

        if (!collections.users) {
            res.status(500).json({ error: 'Database not initialized' });
            return;
        }

        const user = await collections.users.findOne({ cognitoId });

        if (!user) {
            res.status(404).json({ error: 'User not found in database' });
            return;
        }

        // Don't send password/hashedPassword to client
        const { password, hashedPassword, ...safeUser } = user as any;

        res.json(safeUser);
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update current authenticated user's profile
router.put('/me', verifyCognitoToken, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const cognitoId = req.user?.sub;

        if (!cognitoId) {
            res.status(400).json({ error: 'Invalid user token' });
            return;
        }

        if (!collections.users) {
            res.status(500).json({ error: 'Database not initialized' });
            return;
        }

        const { username, phonenumber } = req.body;

        // Validate the updates
        const allowedUpdates: any = {};
        
        if (username) {
            if (!/^[a-zA-ZÀ-ÿ0-9'_-]+$/.test(username)) {
                res.status(400).json({ error: 'Invalid username format' });
                return;
            }
            allowedUpdates.username = username;
        }

        if (phonenumber) {
            if (!/^(?:\+353|0)87\d{7}$/.test(phonenumber)) {
                res.status(400).json({ error: 'Invalid phone number format' });
                return;
            }
            allowedUpdates.phonenumber = phonenumber;
        }

        if (Object.keys(allowedUpdates).length === 0) {
            res.status(400).json({ error: 'No valid fields to update' });
            return;
        }

        const result = await collections.users.findOneAndUpdate(
            { cognitoId },
            { $set: allowedUpdates },
            { returnDocument: 'after' }
        );

        if (!result) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Don't send password/hashedPassword to client
        const { password, hashedPassword, ...safeUser } = result as any;

        res.json(safeUser);
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;