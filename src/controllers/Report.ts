import { Request, Response } from 'express';
import { Report } from '../models/Report';
import { collections } from '../database';
import { ObjectId } from 'mongodb';

export const getReports = async (req: Request, res: Response) => {
  try {

    const Report = (await collections.Reports?.find({}).toArray()) as unknown as Report[];
    if (Report) {
      res.status(200).send(Report);
    }
    else {
      res.status(500).send("Failed to get Report.");
    }
    

  } catch (error) {
    if (error instanceof Error) 
      { 
        console.log(`issue with inserting ${error.message}`);
      }
      else{
        console.log(`error with ${error}`)
      }
      res.status(500).send("Failed to get Report.");
    }
};
export const getReportById = async (req: Request, res: Response) => {
  //get a single  Report by ID from the database

  let id: string = req.params.id;
  try {
    const query = { _id: new ObjectId(id) };
    const Report = (await collections.Reports?.findOne(query)) as unknown as Report;

    if (Report) {
      res.status(200).send(Report);
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


export const createReport = async (req: Request, res: Response) => {
  const { category, severity, notes, location, Reportedby } = req.body;

  const newReport: Report = {
    category,
    severity,
    notes,
    location,
    timestamp: new Date().toISOString()
  };

  try {
    const result = await collections.Reports?.insertOne(newReport);

    if (result) {
      // Include the MongoDB generated _id in the response
      res.status(201).json({
        _id: result.insertedId,
        ...newReport
      });
    } else {
      res.status(500).json({ message: "Failed to create a new Report." });
    }
  } catch (error) {
    console.error(`Unable to create new Report: ${error}`);
    res.status(500).json({ message: "Server error while creating report." });
  }
};



export const updateReport = async (req: Request, res: Response) => {

    const id: string = req.params.id;
Report
    try {
        const query = { _id: new ObjectId(id) };
        const result = await collections.Reports?.updateOne(query, { $set: req.body });
        
        console.log(result);

        if (result && result.matchedCount) {
            res.status(200).send(`Updated Report with id ${id}`);
        } else if (!result?.matchedCount) {
            res.status(404).send(`Report with id ${id} not found`);
        } else {
            res.status(304).send(`Report with id: ${id} not updated`);
        }
    } catch (error) {
        if (error instanceof Error)
            {
                console.log(`issue with inserting ${error.message}`);
            }
            else{
                console.log(`error with ${error}`)
            }
            res.status(500).send(`Unable to update Report ${id}`);
        }

 
};

export const deleteReport = async(req: Request, res: Response) => {
  let id: string = req.params.id;
  try {
    const query = { _id: new ObjectId(id) };
    const result = await collections.Reports?.deleteOne(query);

    if (result && result.deletedCount === 1) {
      res.status(200).json({"message": `Deleted Report ${req.params.id} from the database`});
    } else {
      res.status(404).send(`Report with id ${req.params.id} not found.`);
    }
  } catch (error) {
    if (error instanceof Error) { 
      console.log(`Unable to delete Report with id: ${error.message}`);
    } else {
      console.log(`error with ${error}`);
    }
    res.status(500).send(`Unable to delete Report ${req.params.id}`);
  }
};
