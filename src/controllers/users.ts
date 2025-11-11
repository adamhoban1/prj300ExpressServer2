import { Request, Response } from 'express';
import { User } from '../models/user';
import { collections } from '../database';

export const getUsers = async (req: Request, res: Response) => {
  try {

    const users = (await collections.users?.find({}).toArray()) as unknown as User[];
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


export const getUserById = (req: Request, res: Response) => {
    let id:string = req.params.id;
    res.json({"message": `get a user ${id} received`})
};

export const createUser = async (req: Request, res: Response) => {
    console.log(req.body);
    const newUser = req.body as User; 
    try {
        const result = await collections.users?.insertOne(newUser)
        if (result) {
            res.status(201).location(`${result.insertedId}`).json({ message: `Created a new user with id ${result.insertedId}` })
        }
        else {
            res.status(500).send("Failed to create a new user.");
        }
    }
    catch (error) {
        console.error(error);
        res.status(400).send(`Unable to create new user`);
    }
};


export const updateUser = (req: Request, res: Response) => {
    console.log(req.body); 
    res.json({"message": `update user ${req.params.id} with data from the post message`})
};

export const deleteUser = (req: Request, res: Response) => {
    res.json({"message": `delete user ${req.params.id} from the database`})
};
