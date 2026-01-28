import axios from "axios";
import { parseStringPromise } from "xml2js";
import { collections } from "../database";
import { Report } from "../models/Report";

const MET_RSS_URL = "https://www.met.ie/warningsxml/rss.xml";

interface RSSItem {
  guid?: string;
  description?: string;
  pubDate?: string;
  title?: string;
}

/**
 * Validates that an RSS feed item has all required fields and they are in the expected format.
 * @param item - The RSS feed item to validate
 * @returns true if the item is valid, false otherwise
 */
const isValidRSSItem = (item: RSSItem): boolean => {
  // Check that all required fields exist
  if (!item.guid || typeof item.guid !== 'string' || item.guid.trim() === '') {
    return false;
  }
  
  if (!item.description || typeof item.description !== 'string') {
    return false;
  }
  
  if (!item.title || typeof item.title !== 'string' || item.title.trim() === '') {
    return false;
  }
  
  if (!item.pubDate || typeof item.pubDate !== 'string' || item.pubDate.trim() === '') {
    return false;
  }
  
  // Validate that pubDate is a valid date
  const date = new Date(item.pubDate);
  if (isNaN(date.getTime())) {
    return false;
  }
  
  return true;
};

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
    // Validate item has all required fields in expected format
    if (!isValidRSSItem(item)) {
      console.warn('Skipping invalid RSS item:', JSON.stringify(item));
      continue;
    }

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
