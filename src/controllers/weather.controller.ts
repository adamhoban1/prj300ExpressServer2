import { Request, Response } from "express";
import { fetchWeatherWarnings } from "../services/metEireann.service";

export const getWeatherWarnings = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const warnings = await fetchWeatherWarnings();
    res.status(200).json(warnings);
  } catch (error) {
    res.status(500).json({
      message: "Unable to retrieve weather warnings",
    });
  }
};
