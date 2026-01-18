import express, { Router } from "express";
import { fetchWeatherWarnings } from "../services/metEireann.service";

const router: Router = express.Router();

router.get("/warnings", async (_req, res) => {
  try {
    const warnings = await fetchWeatherWarnings();
    res.json({
      count: warnings.length,
      warnings
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to retrieve weather warnings"
    });
  }
});

export default router;
