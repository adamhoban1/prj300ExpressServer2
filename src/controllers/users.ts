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

  let _id: string = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  try {
    const query = { _id: new ObjectId(_id) };
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
  // create a new user in the database

console.log(req.body); //for now still log the data
const {username, password, phonenumber, email} = req.body;

const newUser : User = {username: username, password: password, phonenumber: phonenumber, email: email, dateJoined: new Date()};


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
