import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const createReportSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(150),
  rawDescription: z.string().min(10, 'Description must be at least 10 characters').max(3000),
  category: z.enum([
    'FLOOD',
    'ROAD_HAZARD',
    'FIRE',
    'STRUCTURAL_DAMAGE',
    'MEDICAL_EMERGENCY',
    'UTILITY_OUTAGE',
    'SHELTER_REQUEST',
    'OTHER',
  ]).default('OTHER'),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  locationName: z.string().min(3, 'Location description must be at least 3 characters'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  imageUrl: z.string().url().optional().or(z.literal('')),
  reporterName: z.string().max(100).optional(),
  reporterContact: z.string().max(100).optional(),
  reporterConsent: z.boolean().refine((val) => val === true, {
    message: 'Reporter consent is required to process community submissions',
  }),
});

export const updateReportStatusSchema = z.object({
  status: z.enum(['UNVERIFIED', 'UNDER_REVIEW', 'VERIFIED', 'RESOLVED', 'FLAGGED_CONFLICT']),
  notes: z.string().max(1000).optional(),
  isConflicting: z.boolean().optional(),
  conflictNotes: z.string().max(1000).optional(),
});

export const reviewDuplicateSchema = z.object({
  status: z.enum(['CONFIRMED_DUPLICATE', 'REJECTED', 'CORROBORATING_REPORT']),
  reviewNotes: z.string().min(3, 'Review notes are required when making a duplicate ruling').max(1000),
});

export const createHelpRequestSchema = z.object({
  reportId: z.string().optional().nullable(),
  requestType: z.enum(['FOOD', 'WATER', 'SHELTER', 'MEDICAL', 'EVACUATION', 'POWER', 'OTHER']),
  description: z.string().min(5).max(1000),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  peopleCount: z.number().int().min(1).default(1),
  specialNeeds: z.string().max(500).optional().nullable(),
  requesterName: z.string().max(100).optional().nullable(),
  requesterContact: z.string().max(100).optional().nullable(),
});

export const assignResourceSchema = z.object({
  resourceId: z.string().min(1, 'Resource ID is required'),
  notes: z.string().max(500).optional(),
});

export function validateBody(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      });
    }
    req.body = result.data;
    next();
  };
}
