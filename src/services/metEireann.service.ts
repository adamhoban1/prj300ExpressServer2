import axios from "axios";
import { parseStringPromise } from "xml2js";
import { collections } from "../database";
import { Report } from "../models/Report";
import { WeatherAlert } from "../models/weather";
import { guid } from "zod";
import { time } from "console";

const MET_RSS_URL = "https://www.met.ie/warningsxml/rss.xml";


 //Imports weather warnings from Met Éireann RSS feed and inserts them as Reports into MongoDB.

export const importWeatherWarnings = async (): Promise<number> => {
  if (!collections.WeatherAlerts) {
    throw new Error("Weather Alerts collection not initialised");
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
    const existing = await collections.WeatherAlerts.findOne({
      guid: item.guid
    });
    if (existing) continue;

    // Add additional fields from the guid/ cap xml file if available
    let capData: any = {};
    if (item.guid) {
      try {
        const capResponse = await axios.get(item.guid, {timeout: 5000});

        // Parse CAP XML data
        const capParsed = await parseStringPromise(capResponse.data, {
          explicitArray: false
        });
        capData = capParsed;
      } catch (error: unknown) {
        // If CAP XML fails, continue with RSS data only
        console.warn(`Failed to fetch or parse CAP XML for guid ${item.guid}: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }

    // Map RSS fields to Report schema
    /*const report: Report = {
      severity: 'Moderate', // Default, you could map based on title if you want
      category: "Weather Warning",
      notes: item.description,
      timestamp: new Date(item.pubDate).toISOString(),
      location: {
        address: item.title // Use title as descriptive location
      },
      source: "MET_EIREANN",
      externalId: item.guid
    };*/
    // Use new weather alert model to store met eirann alerst properly
    const weatherAlert: WeatherAlert = {
      title: item.title,
      link: item.link,
      description: item.description,
      author: item.author,
      category: item.category,
      guid: item.guid,
      pubDate: item.pubDate,
      event: capData?.alert?.info?.event || undefined,
      headline: capData?.alert?.info?.headline || undefined,
      urgency: capData?.alert?.info?.urgency || undefined,
      severity: capData?.alert?.info?.severity || undefined,
      certainty: capData?.alert?.info?.certainty || undefined,
      onset: capData?.alert?.info?.onset || undefined,
      expires: capData?.alert?.info?.expires || undefined,
      effective: capData?.alert?.info?.effective || undefined,
      instruction: capData?.alert?.info?.instruction || undefined,
      areaDesc: capData?.alert?.info?.areaDesc || undefined,
      emmaCodes: capData?.alert?.info?.emmaCodes || undefined
    };

    await collections.WeatherAlerts.insertOne(weatherAlert);
    imported++;
  }

  return imported;
};
