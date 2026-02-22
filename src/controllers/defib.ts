import { Request, Response } from 'express';
import { Defib } from '../models/defib';
import { collections } from '../database';
import { ObjectId } from 'mongodb';
import { uploadImage } from '../services/s3.service';

export const getDefibs = async (req: Request, res: Response) => {
  try {

    const defibs = (await collections.Defibs?.find({}).toArray()) as unknown as Defib[];
    if (defibs) {
      res.status(200).send(defibs);
    }
    else {
      res.status(500).send("Failed to get Defibs.");
    }
    

  } catch (error) {
    if (error instanceof Error) 
      { 
        console.log(`issue with inserting ${error.message}`);
      }
      else{
        console.log(`error with ${error}`)
      }
      res.status(500).send("Failed to get Defibs.");
    }
};
export const getDefibById = async (req: Request, res: Response) => {
  //get a single  Defib by ID from the database

  let id: string = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  try {
    const query = { _id: new ObjectId(id) };
    const defib = (await collections.Defibs?.findOne(query)) as unknown as Defib;

    if (defib) {
      res.status(200).send(defib);
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


export const createDefib = async (req: Request, res: Response) => {
  console.log(req.body);
  const { working, photoUrl, location, accessInstructions } = req.body;

    try {
      let imageUrl = "";
      if (typeof photoUrl === "string" && photoUrl.startsWith("data:image/")) {
        imageUrl = await uploadImage(photoUrl, "defibs");
      }

      const newDefib: Defib = {
        working,
        photoUrl: imageUrl,
        location,
        accessInstructions,
        timestamp: new Date().toISOString(),
      };

      const result = await collections.Defibs?.insertOne(newDefib);

      if (result) {
        res.status(201).location(`${result.insertedId}`).json({ message: `Created a new Defib with id ${result.insertedId}` });
      } else {
        res.status(500).send("Failed to create a new Defib.");
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log(`Unable to create new Defib ${error.message}`);
      } else {
        console.log(`error with ${error}`);
      }
      res.status(400).send(`Unable to create new Defib ${req.params.id}`);
    }
};




export const updateDefib = async (req: Request, res: Response) => {
    const id: string = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    try {
      let imageUrl = "";
      if (typeof req.body.photoUrl === "string" && req.body.photoUrl.startsWith("data:image/")) {
        imageUrl = await uploadImage(req.body.photoUrl, "defibs");
      }
      const query = { _id: new ObjectId(id) };
      const defibUpdated = {
        working: req.body.working,
        photoUrl: imageUrl,
        location: req.body.location,
        accessInstructions: req.body.accessInstructions,
        timestamp: req.body.timestamp,
      }
      const result = await collections.Defibs?.updateOne(query, { $set: defibUpdated });

      if (result && result.matchedCount) {
        return res.status(200).json({
          message: "Defib updated successfully",
          id
        });
      } else if (!result?.matchedCount) {
        return res.status(404).json({ message: `Defib with id ${id} not found` });
      } else {
        return res.status(304).json({ message: `Defib with id ${id} not updated` });
      }
    } catch (error) {
      return res.status(500).json({ message: `Unable to update Defib ${id}` });
    }
};

export const deleteDefib = async(req: Request, res: Response) => {
  let id: string = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  try {
    const query = { _id: new ObjectId(id) };
    const result = await collections.Defibs?.deleteOne(query);

    if (result && result.deletedCount === 1) {
      res.status(200).json({"message": `Deleted Defib ${req.params.id} from the database`});
    } else {
      res.status(404).send(`Defib with id ${req.params.id} not found.`);
    }
  } catch (error) {
    if (error instanceof Error) { 
      console.log(`Unable to delete Defib with id: ${error.message}`);
    } else {
      console.log(`error with ${error}`);
    }
    res.status(500).send(`Unable to delete Defib ${req.params.id}`);
  }
};
