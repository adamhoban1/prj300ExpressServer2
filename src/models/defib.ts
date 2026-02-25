import { ObjectId } from "mongodb";
import { z } from "zod";

export interface Defib {
    _id?: ObjectId;
    working: boolean;
    timestamp: string;
    photoUrl?: string;
    accessInstructions?: string;
    location: {
        lat?: number;
        lng?: number;
        address?: string;
    };
}

export const createDefibSchema = z.object({
    working: z.boolean(),
    timestamp: z.string().min(1),
    photoUrl: z.string().url().optional(),
    accessInstructions: z.string().optional(),
    location: z.object({
        lat: z.number().optional(),
        lng: z.number().optional(),
        address: z.string().optional(),
    }),
});

export const updateDefibSchema = z.object({
    working: z.boolean().optional(),
    timestamp: z.string().optional(),
    photoUrl: z.string().url().optional(),
    accessInstructions: z.string().optional(),
    location: z.object({
        lat: z.number().optional(),
        lng: z.number().optional(),
        address: z.string().optional(),
    }).optional(),
});