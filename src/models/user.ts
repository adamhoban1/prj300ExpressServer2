// models/user.ts
import { ObjectId } from "mongodb";
import { z } from "zod";

export interface User {
    _id?: ObjectId;
    username: string;
    phonenumber?: string;
    email: string;
    password?: string;
    hashedPassword?: string;
    dateJoined?: Date;
    //Notification fields
    fcmToken?: string;
    location?: {
        type: "Point";
        coordinates: [number, number]; // [longitude, latitude]
    };
    // NEW: Cognito fields
    cognitoId?: string;  // Links to Cognito user
    lastLogin?: Date;
}

export const createUserSchema = z.object({
    username: z.string().min(1).regex(/^[a-zA-ZÀ-ÿ0-9'_-]+$/),
    password: z.string().min(6).max(64),
    phonenumber: z.string().regex(/^(?:\+353|0)87\d{7}$/),
    email: z.string().email(),
    fcmToken: z.string().optional(),
    location: z.object({
        type: z.literal("Point"),
        coordinates: z.tuple([z.number(), z.number()])
    }).optional()
});

export const updateUserSchema = z.object({
    username: z.string().min(1).regex(/^[a-zA-ZÀ-ÿ0-9'_-]+$/).optional(),
    password: z.string().min(6).max(64).optional(),
    phonenumber: z.string().regex(/^(?:\+353|0)87\d{7}$/).optional(),
    email: z.string().email().optional(),
    fcmToken: z.string().optional(),
    location: z.object({
        type: z.literal("Point"),
        coordinates: z.tuple([z.number(), z.number()])
    }).optional()
    
});

// NEW: Schema for Cognito user sync
export const cognitoUserSchema = z.object({
    cognitoId: z.string(),
    email: z.string().email(),
    username: z.string().optional()
});