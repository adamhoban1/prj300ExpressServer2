import axios from "axios";
import { parseStringPromise } from "xml2js";
import { collections } from "../database";
import { Report } from "../models/Report";

const MET_RSS_URL = "https://www.met.ie/warningsxml/rss.xml";


 //Imports weather warnings from Met Éireann RSS feed and inserts them as Reports into MongoDB.

export const importWeatherWarnings = async (): Promise<number> => {
  if (!collections.Reports) {
    throw new Error("Reports collection not initialised");
  }

  let rssXml: string;

  try {
    const response = await axios.get(MET_RSS_URL);
    rssXml = response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(
          `Failed to fetch Met Éireann RSS feed: received HTTP ${error.response.status} ${error.response.statusText}`
        );
      }
      if (error.request) {
        throw new Error(
          "Failed to fetch Met Éireann RSS feed: no response received from Met Éireann server"
        );
      }
      throw new Error(
        `Failed to fetch Met Éireann RSS feed: ${error.message}`
      );
    }

    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    throw new Error(
      `Failed to fetch Met Éireann RSS feed: ${message}`
    );
  }

  let parsed: any;
  try {
    parsed = await parseStringPromise(rssXml, {
      explicitArray: false
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown XML parsing error";
    throw new Error(
      `Failed to parse Met Éireann RSS feed XML: ${message}`
    );
  }
  // Handle single or multiple items
  const items = parsed.rss.channel.item || [];
  const warnings = Array.isArray(items) ? items : [items];

  let imported = 0;

  for (const item of warnings) {
    // Skip if already exists based on externalId so no duplicates
    const existing = await collections.Reports.findOne({
      externalId: item.guid
    });
    if (existing) continue;

    // Map RSS fields to Report schema
    const report: Report = {
      severity: 'Moderate', // Default, you could map based on title if you want
      category: "Weather Warning",
      notes: item.description,
      timestamp: new Date(item.pubDate).toISOString(),
      location: {
        address: item.title // Use title as descriptive location
      },
      source: "MET_EIREANN",
      externalId: item.guid
    };

    await collections.Reports.insertOne(report);
    imported++;
  }

  return imported;
};
