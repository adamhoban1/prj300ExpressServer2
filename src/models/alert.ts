import { ObjectId } from "mongodb";
import { z } from "zod";

export interface alert {
    _id?: ObjectId;
    category: string;
    severity: string;
    notes: string;
    location: string;
    Reportedby: string;
    datecreated?: Date;
}


export const createalertSchema = z.object({
    category: z.string().min(1),
    severity: z.string().min(1),
    notes: z.string().min(1).optional(),
    location: z.string().min(1),
    Reportedby: z.string().min(24)
});

export const updatealertSchema = z.object({
    category: z.string().min(1).optional(),
    severity: z.string().min(1).optional(),
    notes: z.string().min(1).optional(),
    location: z.string().min(1).optional(),
});

