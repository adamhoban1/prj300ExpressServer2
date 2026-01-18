import { Request, Response } from "express";
import { importWeatherWarnings } from "../services/metEireann.service";

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
