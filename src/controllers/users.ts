import { Request, Response } from 'express';
import { User } from '../models/user';
import { collections } from '../database';
import { ObjectId } from 'mongodb';

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
export const getUserById = async (req: Request, res: Response) => {
  //get a single  user by ID from the database

  let id: string = req.params.id;
  try {
    const query = { _id: new ObjectId(id) };
    const user = (await collections.users?.findOne(query)) as unknown as User;

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

export const deleteUser = async(req: Request, res: Response) => {
  let id: string = req.params.id;
  try {
    const query = { _id: new ObjectId(id) };
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
