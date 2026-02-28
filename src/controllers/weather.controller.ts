import { Request, Response } from "express";
import { importWeatherWarnings } from "../services/metEireann.service";
import { collections } from "../database";
import { WeatherAlert } from "../models/weather";

export const getWeatherWarnings = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const count = await importWeatherWarnings();
    res.status(200).json({ imported: count });
  } catch (error) {
    res.status(500).json({
      message: "Unable to retrieve weather warnings",
    });
  }
};

export const getWeatherAlerts = async (req: Request, res: Response) => {
  try {

    const reports = (await collections.WeatherAlerts?.find({}).toArray()) as unknown as WeatherAlert[];
    if (reports) {
      res.status(200).send(reports);
    }
    else {
      res.status(500).send("Failed to get Weather Alerts.");
    }
    

  } catch (error) {
    if (error instanceof Error) 
      { 
        console.log(`issue with getting Weather Alerts ${error.message}`);
      }
      else{
        console.log(`error with ${error}`)
      }
      res.status(500).send("Failed to get Weather Alerts.");
    }
};