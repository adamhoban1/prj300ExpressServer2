import { ObjectId } from "mongodb";
import { z } from "zod";

export interface User {
    id?: ObjectId;
    username: string;
    password?: string;
    phonenumber: string;
    email: string;
    dateJoined?: Date;
    deviceToken?: string;
    notifications?: {
        weather: boolean;
        emergencies: boolean;
        social: boolean;
        }
}

export const createUserSchema = z.object({
    username: z.string().min(1).regex(/^[a-zA-ZÀ-ÿ0-9'_-]+$/), // Letters, spaces and numbers
    password: z.string().min(6),
    phonenumber: z.string().regex(/^(?:\+353|0)87\d{7}$/), // E.164 format 
    email: z.email(),
    deviceToken: z.string().optional(),
    notifications: z.object({
        weather: z.boolean().default(true),
        emergencies: z.boolean().default(true),
        social: z.boolean().default(true),
    }).optional()
});

export const updateUserSchema = z.object({
  username: z.string().min(1).regex(/^[a-zA-ZÀ-ÿ0-9'_-]+$/).optional(), // Only letters and spaces
    password: z.string().min(6).optional(),
    phonenumber: z.string().regex(/^(?:\+353|0)87\d{7}$/).optional(), // E.164 format 
    email: z.email().optional(),
    deviceToken: z.string().optional()
});
