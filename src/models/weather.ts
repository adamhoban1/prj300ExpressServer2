import { ObjectId } from "mongodb";
import { z } from "zod";


export interface WeatherAlert {
    _id?: ObjectId;
    title: string;
    link: string;
    description: string;
    author: string;
    category: string;
    guid: string;
    pubDate: string;
    // Additional fields from the guid/ cap xml file
    event?: string;
    headline?: string;
    urgency?: string;
    severity?: string;
    certainty?: string;
    onset?: Date | string;
    expires?: Date | string;
    effective?: Date | string;
    instruction?: string;
    areaDesc?: string;
    emmaCodes?: string;
}

export const createWeatherAlert = z.object({
    title: z.string().min(1),
    link: z.string().url(),
    description: z.string().min(1),
    author: z.string().min(1),
    category: z.string().min(1),
    guid: z.string().min(1),
    pubDate: z.string().min(1),
    event: z.string().min(1).optional(),
    headline: z.string().min(1).optional(),
    urgency: z.string().min(1).optional(),
    severity: z.string().min(1).optional(),
    certainty: z.string().min(1).optional(),
    instruction: z.string().min(1).optional(),
    areaDesc: z.string().min(1).optional(),
    emmaCodes: z.string().min(1).optional()
});

export const updateWeatherAlertSchema = z.object({
    title: z.string().min(1).optional(),
    link: z.string().url().optional(),
    description: z.string().min(1).optional(),
    author: z.string().min(1).optional(),
    category: z.string().min(1).optional(),
    guid: z.string().min(1).optional(),
    pubDate: z.string().min(1).optional(),
    event: z.string().min(1).optional(),
    headline: z.string().min(1).optional(),
    urgency: z.string().min(1).optional(),
    severity: z.string().min(1).optional(),
    certainty: z.string().min(1).optional(),
    instruction: z.string().min(1).optional(),
    areaDesc: z.string().min(1).optional(),
    emmaCodes: z.string().min(1).optional()
    
});