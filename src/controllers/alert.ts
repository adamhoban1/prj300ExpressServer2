import { Request, Response } from 'express';
import { alert } from '../models/alert';
import { collections } from '../database';
import { ObjectId } from 'mongodb';

export const getAlerts = async (req: Request, res: Response) => {
  try {

    const alert = (await collections.alerts?.find({}).toArray()) as unknown as alert[];
    if (alert) {
      res.status(200).send(alert);
    }
    else {
      res.status(500).send("Failed to get alert.");
    }
    

  } catch (error) {
    if (error instanceof Error) 
      { 
        console.log(`issue with inserting ${error.message}`);
      }
      else{
        console.log(`error with ${error}`)
      }
      res.status(500).send("Failed to get alert.");
    }
};
export const getalertById = async (req: Request, res: Response) => {
  //get a single  alert by ID from the database

  let id: string = req.params.id;
  try {
    const query = { _id: new ObjectId(id) };
    const alert = (await collections.alerts?.findOne(query)) as unknown as alert;

    if (alert) {
      res.status(200).send(alert);
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


export const createalert = async (req: Request, res: Response) => {
  // create a new alert in the database

console.log(req.body); //for now still log the data
const {category, severity, notes, location, Reportedby} = req.body;

const newalert : alert = {category: category, severity: severity, notes: notes, location: location, Reportedby: Reportedby, datecreated: new Date()};


try {
  const result = await collections.alerts?.insertOne(newalert)

if (result) {
  res.status(201).location(`${result.insertedId}`).json({ message: `Created a new alert with id ${result.insertedId}` })
}
else {
  res.status(500).send("Failed to create a new alert.");
}
}
catch (error) {
  if (error instanceof Error) 
    { 
      console.log(`Unable to create new alert ${error.message}`);
    }
    else{
      console.log(`error with ${error}`)
    }
    res.status(400).send(`Unable to create new alert ${req.params.id}`);
  }
};



export const updatealert = async (req: Request, res: Response) => {

    const id: string = req.params.id;
alert
    try {
        const query = { _id: new ObjectId(id) };
        const result = await collections.alerts?.updateOne(query, { $set: req.body });
        
        console.log(result);

        if (result && result.matchedCount) {
            res.status(200).send(`Updated alert with id ${id}`);
        } else if (!result?.matchedCount) {
            res.status(404).send(`alert with id ${id} not found`);
        } else {
            res.status(304).send(`alert with id: ${id} not updated`);
        }
    } catch (error) {
        if (error instanceof Error)
            {
                console.log(`issue with inserting ${error.message}`);
            }
            else{
                console.log(`error with ${error}`)
            }
            res.status(500).send(`Unable to update alert ${id}`);
        }

 
};

export const deletealert = async(req: Request, res: Response) => {
  let id: string = req.params.id;
  try {
    const query = { _id: new ObjectId(id) };
    const result = await collections.alerts?.deleteOne(query);

    if (result && result.deletedCount === 1) {
      res.status(200).json({"message": `Deleted alert ${req.params.id} from the database`});
    } else {
      res.status(404).send(`alert with id ${req.params.id} not found.`);
    }
  } catch (error) {
    if (error instanceof Error) { 
      console.log(`Unable to delete alert with id: ${error.message}`);
    } else {
      console.log(`error with ${error}`);
    }
    res.status(500).send(`Unable to delete alert ${req.params.id}`);
  }
};
