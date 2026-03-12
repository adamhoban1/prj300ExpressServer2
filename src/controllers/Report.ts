import { Request, Response } from 'express';
import { Report } from '../models/Report';
import { collections } from '../database';
import { ObjectId } from 'mongodb';
import { notifyNearbyUsers } from "../services/notification.service";
import { uploadImage } from '../services/s3.service';
import { AuthRequest } from '../middleware/cognitoAuth';

export const getReports = async (req: Request, res: Response) => {
  try {

    const reports = (await collections.Reports?.find({}).toArray()) as unknown as Report[];
    if (reports) {
      res.status(200).send(reports);
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

  let id: string = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  try {
    const query = { _id: new ObjectId(id) };
    const report = (await collections.Reports?.findOne(query)) as unknown as Report;

    if (report) {
      res.status(200).send(report);
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
  // create a new report in the database

  console.log(req.body); //for now still log the data
  const {category, severity, notes, location, photoUrl, UserId, cognitoId} = req.body;

  const newReport : Report = {category: category, severity: severity, notes: notes, photoUrl: photoUrl, location: location, timestamp: new Date().toISOString(), UserId: UserId, cognitoId: cognitoId};
    
  try {
    let imageUrl = "";
      if (typeof photoUrl === "string" && photoUrl.startsWith("data:image/")) {
        imageUrl = await uploadImage(photoUrl, "defibs");
      }
      
    const result = await collections.Reports?.insertOne({...newReport, photoUrl: imageUrl})
    if (result) {
      // If report made succesfully pass info to notify all users nearby the report location
      if (newReport.location?.lat && newReport.location?.lng) {
        await notifyNearbyUsers(
          [newReport.location.lng, newReport.location.lat],
          5000, // radius in meters 50km in km
          `${newReport.category} | ${newReport.severity}`,
          `${newReport.notes || 'No additional notes provided.'}`,
          { reportId: result.insertedId.toString() }
        );
      }
    }
    else {
      res.status(500).send("Failed to create a new Report.");
    }
    }
    catch (error) {
      if (error instanceof Error) 
        { 
          console.log(`Unable to create new Report ${error.message}`);
        }
        else{
          console.log(`error with ${error}`)
        }
        res.status(400).send(`Unable to create new Report ${req.params.id}`);
      }
    };



  export const updateReport = async (req: AuthRequest, res: Response) => {
    const id: string = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const cognitoId = req.user?.sub;

    if (!cognitoId) {
      res.status(400).json({ error: 'Invalid user token' });
      return;
    }

      const { category, severity, notes, location, photoUrl, UserId, timestamp, source } = req.body;

      try {
          const query = { _id: new ObjectId(id) };

          // Handle photo upload the same way as createReport
          let imageUrl = "";
          if (typeof photoUrl === "string" && photoUrl.startsWith("data:image/")) {
              imageUrl = await uploadImage(photoUrl, "reports");
          }

          const reportUpdated: Partial<Report> = {
              category,
              severity,
              notes: notes ?? '',
              location,
              photoUrl: imageUrl,
              timestamp: timestamp ?? new Date().toISOString(),
              UserId,
              source
          };

          const result = await collections.Reports?.updateOne(query, { $set: reportUpdated });

          if (result && result.matchedCount) {
              return res.status(200).json({
                  message: "Report updated successfully",
                  id
              });
          } else if (!result?.matchedCount) {
              return res.status(404).json({ message: `Report with id ${id} not found` });
          } else {
              return res.status(304).json({ message: `Report with id ${id} not updated` });
          }
      } catch (error) {
          if (error instanceof Error) {
              console.log(`Unable to update Report ${error.message}`);
          } else {
              console.log(`error with ${error}`);
          }
          return res.status(500).json({ message: `Unable to update Report ${id}` });
      }
};

export const deleteReport = async (req: AuthRequest, res: Response) => {
  let id: string = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const cognitoId = req.user?.sub;

  if (!cognitoId) {
    res.status(400).json({ error: 'Invalid user token' });
    return;
  }

  try {
    const query = { _id: new ObjectId(id) };
    
    // First, check if report exists
    const existingReport = (await collections.Reports?.findOne(query)) as unknown as Report;
    
    if (!existingReport) {
      res.status(404).send(`Report with id ${id} not found.`);
      return;
    }

    // Check if user is owner ONLY (removed admin check)
    const isOwner = existingReport.cognitoId === cognitoId;
    
    if (!isOwner) {
      res.status(403).json({ 
        error: 'Forbidden', 
        message: 'You can only delete your own reports' 
      });
      return;
    }

    const result = await collections.Reports?.deleteOne(query);

    if (result && result.deletedCount === 1) {
      res.status(200).json({
        message: `Deleted Report ${id} from the database`
      });
    } else {
      res.status(404).send(`Report with id ${id} not found.`);
    }
  } catch (error) {
    if (error instanceof Error) { 
      console.log(`Unable to delete Report with id: ${error.message}`);
    } else {
      console.log(`Error with ${error}`);
    }
    res.status(500).send(`Unable to delete Report ${id}`);
  }
};

