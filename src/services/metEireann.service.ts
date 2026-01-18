import axios from "axios";
import { parseStringPromise } from "xml2js";

const MET_EIREANN_RSS_URL = "https://www.met.ie/warningsxml/rss.xml";

export const fetchWeatherWarnings = async () => {
  const response = await axios.get(MET_EIREANN_RSS_URL, {
    timeout: 10000,
    headers: {
      "User-Agent": "EmergencyAlertApp/1.0"
    }
  });

  const parsed = await parseStringPromise(response.data, {
    explicitArray: false
  });

  const items = parsed.rss.channel.item || [];

  return Array.isArray(items)
    ? items.map(mapWarning)
    : [mapWarning(items)];
};

const mapWarning = (item: any) => ({
  title: item.title,
  description: item.description,
  category: item.category,
  link: item.link,
  published: item.pubDate,
  source: "Met Éireann"
});
