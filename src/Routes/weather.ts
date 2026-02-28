import express, { Router } from "express";
import { importWeatherWarnings } from "../services/metEireann.service";
import { getWeatherAlerts } from "../controllers/weather.controller";

const router: Router = express.Router();

router.get('/', getWeatherAlerts);

router.post("/import", async (_req, res) => {
  try {
    const count = await importWeatherWarnings();
    res.json({
      message: "Weather warnings imported",
      imported: count
    });
  } catch (err) {
    res.status(500).json({
      message: "Unable to import weather warnings",
      error: err instanceof Error ? err.message : err
    });
  }
});


export default router;
