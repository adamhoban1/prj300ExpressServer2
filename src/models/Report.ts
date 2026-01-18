import { ObjectId } from "mongodb";
import { z } from "zod";

/*
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
*/

export interface Report {
    _id?: ObjectId;
    severity: 'Low' | 'Moderate' | 'High' | 'Info' | 'Urgent';
    category: string;
    notes?: string;
    timestamp: string;
    location: { lat?: number; lng?: number; address?: string };
    source?: 'USER' | 'MET_EIREANN';
    externalId?: string;
}

export const createReportSchema = z.object({
    severity: z.enum(['Low', 'Moderate', 'High', 'Info', 'Urgent']),
    category: z.string().min(1),
    notes: z.string().min(0).optional(),
    timestamp: z.string().min(1),       
    location: z.object({
        lat: z.number().optional(),
        lng: z.number().optional(),
        address: z.string().min(1).optional()
    }),
    source: z.enum(['USER', 'MET_EIREANN']).optional(),
    externalId: z.string().min(1).optional()
});

export const updateReportSchema = z.object({
    severity: z.enum(['Low', 'Moderate', 'High', 'Info', 'Urgent']).optional(),
    category: z.string().min(1).optional(),
    notes: z.string().min(1).optional(),
    timestamp: z.string().min(1).optional(),
    location: z.object({
        lat: z.number().optional(),
        lng: z.number().optional(),
        address: z.string().min(1).optional()
    }).optional(),
    source: z.enum(['USER', 'MET_EIREANN']).optional(),
    externalId: z.string().min(1).optional()
});