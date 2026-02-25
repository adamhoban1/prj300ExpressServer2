import { Request, Response } from 'express';
import { User } from '../models/user';
import { collections } from '../database';
import { ObjectId } from 'mongodb';
import { z } from 'zod';
import * as argon2 from 'argon2';
import { AuthRequest } from '../middleware/cognitoAuth';

export const getUsers = async (req: Request, res: Response) => {
  try {

    const users = (await collections.users?.find({}).project({ hashedPassword: 0, password: 0 }).toArray()) as unknown as User[];
    if (users) {
      res.status(200).send(users);
    }
    else {
      res.status(500).send("Failed to get users.");
    }
    

  } catch (error) {
    if (error instanceof Error) 
      { 
        console.log(`issue with inserting ${error.message}`);
      }
      else{
        console.log(`error with ${error}`)
      }
      res.status(500).send("Failed to get users.");
    }
};
export const getUserById = async (req: Request, res: Response) => {
  //get a single  user by ID from the database

  let _id: string = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  try {
    const query = { _id: new ObjectId(_id) };
    const user = (await collections.users?.findOne(query, { projection: { hashedPassword: 0, password: 0 } })) as unknown as User;

    if (user) {
      res.status(200).send(user);
    }
    else {
      res.status(404).send(`Unable to find matching document with id: ${req.params.id}`);
    }
  } catch (error) {
    if (error instanceof Error) 
      { 
        console.log(`Unable to find matching document with id: ${error.message}`);
      }
      else{
        console.log(`error with ${error}`)
      }
      res.status(404).send(`Unable to find matching document with id 2: ${req.params.id}`);
    }
};


export const createUser = async (req: Request, res: Response) => {
  // create a new user in the database

console.log(req.body); //for now still log the data
const {username, cognitoId, phonenumber, email} = req.body;

try {
  const existingUser = await collections.users?.findOne({ email: req.body.email })

  if (existingUser) {
    res.status(400).json({ "error": "existing email" });
    return;
  }

const newUser : User = {username: username, cognitoId: cognitoId, phonenumber: phonenumber, email: email, dateJoined: new Date()};


const result = await collections.users?.insertOne(newUser)

if (result) {
  res.status(201).location(`${result.insertedId}`).json({ message: `Created a new user with id ${result.insertedId}` })
}
else {
  res.status(500).send("Failed to create a new user.");
}
}
catch (error) {
  if (error instanceof Error) 
    { 
      console.log(`Unable to create new user ${error.message}`);
    }
    else{
      console.log(`error with ${error}`)
    }
    res.status(400).send(`Unable to create new user ${req.params.id}`);
  }
};



export const updateUser = async (req: Request, res: Response) => {

    const _id: string = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    try {
        const query = { _id: new ObjectId(_id) };
        const result = await collections.users?.updateOne(query, { $set: req.body });
        
        console.log(result);

        if (result && result.matchedCount) {
            res.status(200).send(`Updated user with id ${_id}`);
        } else if (!result?.matchedCount) {
            res.status(404).send(`User with id ${_id} not found`);
        } else {
            res.status(304).send(`User with id: ${_id} not updated`);
        }
    } catch (error) {
        if (error instanceof Error)
            {
                console.log(`issue with inserting ${error.message}`);
            }
            else{
                console.log(`error with ${error}`)
            }
            res.status(500).send(`Unable to update user ${_id}`);
        }

 
};

export const deleteUser = async(req: Request, res: Response) => {
  let _id: string = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  try {
    const query = { _id: new ObjectId(_id) };
    const result = await collections.users?.deleteOne(query);

    if (result && result.deletedCount === 1) {
      res.status(200).json({"message": `Deleted user ${req.params.id} from the database`});
    } else {
      res.status(404).send(`User with id ${req.params.id} not found.`);
    }
  } catch (error) {
    if (error instanceof Error) { 
      console.log(`Unable to delete user with id: ${error.message}`);
    } else {
      console.log(`error with ${error}`);
    }
    res.status(500).send(`Unable to delete user ${req.params.id}`);
  }
};


export const syncCognitoUser = async (req: AuthRequest, res: Response): Promise<void> => {// this checks if a user with the Cognito ID exists in our database, creates them if not, and updates their last login time and email on every login
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

    const user = await collections.users.findOne({ cognitoId });

    if (!user) {
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
      return;
    }

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
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCurrentUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {// this returns the authenticated user's profile based on the Cognito token
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

    const { password, hashedPassword, ...safeUser } = user as any;
    res.json(safeUser);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCurrentUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {// this allows the authenticated user to update their username and phone number with validation
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

    const { password, hashedPassword, ...safeUser } = result as any;
    res.json(safeUser);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
