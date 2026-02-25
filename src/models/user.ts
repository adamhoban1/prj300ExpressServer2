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
    cognitoId?: string;// Links to Cognito user
    lastLogin?: Date;
}

export const createUserSchema = z.object({
    username: z.string().min(1).regex(/^[a-zA-ZÀ-ÿ0-9'_-]+$/),
    phonenumber: z.string().regex(/^(?:\+353|0)87\d{7}$/).optional(),
    email: z.string().email(),
    cognitoId: z.string().optional()
});

export const updateUserSchema = z.object({
    username: z.string().min(1).regex(/^[a-zA-ZÀ-ÿ0-9'_-]+$/).optional(),
    phonenumber: z.string().regex(/^(?:\+353|0)87\d{7}$/).optional(),
    email: z.string().email().optional(),
    cognitoId: z.string().optional()
});


export const cognitoUserSchema = z.object({
    cognitoId: z.string(),
    email: z.string().email(),
    username: z.string().optional()
});