"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignResourceSchema = exports.createHelpRequestSchema = exports.reviewDuplicateSchema = exports.updateReportStatusSchema = exports.createReportSchema = void 0;
exports.validateBody = validateBody;
const zod_1 = require("zod");
exports.createReportSchema = zod_1.z.object({
    title: zod_1.z.string().min(3, 'Title must be at least 3 characters').max(150),
    rawDescription: zod_1.z.string().min(10, 'Description must be at least 10 characters').max(3000),
    category: zod_1.z.enum([
        'FLOOD',
        'ROAD_HAZARD',
        'FIRE',
        'STRUCTURAL_DAMAGE',
        'MEDICAL_EMERGENCY',
        'UTILITY_OUTAGE',
        'SHELTER_REQUEST',
        'OTHER',
    ]).default('OTHER'),
    urgency: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    locationName: zod_1.z.string().min(3, 'Location description must be at least 3 characters'),
    latitude: zod_1.z.number().min(-90).max(90),
    longitude: zod_1.z.number().min(-180).max(180),
    imageUrl: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
    reporterName: zod_1.z.string().max(100).optional(),
    reporterContact: zod_1.z.string().max(100).optional(),
    reporterConsent: zod_1.z.boolean().refine((val) => val === true, {
        message: 'Reporter consent is required to process community submissions',
    }),
});
exports.updateReportStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['UNVERIFIED', 'UNDER_REVIEW', 'VERIFIED', 'RESOLVED', 'FLAGGED_CONFLICT']),
    notes: zod_1.z.string().max(1000).optional(),
    isConflicting: zod_1.z.boolean().optional(),
    conflictNotes: zod_1.z.string().max(1000).optional(),
});
exports.reviewDuplicateSchema = zod_1.z.object({
    status: zod_1.z.enum(['CONFIRMED_DUPLICATE', 'REJECTED', 'CORROBORATING_REPORT']),
    reviewNotes: zod_1.z.string().min(3, 'Review notes are required when making a duplicate ruling').max(1000),
});
exports.createHelpRequestSchema = zod_1.z.object({
    reportId: zod_1.z.string().optional().nullable(),
    requestType: zod_1.z.enum(['FOOD', 'WATER', 'SHELTER', 'MEDICAL', 'EVACUATION', 'POWER', 'OTHER']),
    description: zod_1.z.string().min(5).max(1000),
    urgency: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
    peopleCount: zod_1.z.number().int().min(1).default(1),
    specialNeeds: zod_1.z.string().max(500).optional().nullable(),
    requesterName: zod_1.z.string().max(100).optional().nullable(),
    requesterContact: zod_1.z.string().max(100).optional().nullable(),
});
exports.assignResourceSchema = zod_1.z.object({
    resourceId: zod_1.z.string().min(1, 'Resource ID is required'),
    notes: zod_1.z.string().max(500).optional(),
});
function validateBody(schema) {
    return (req, res, next) => {
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
