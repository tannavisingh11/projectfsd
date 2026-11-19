"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const validation_js_1 = require("../middleware/validation.js");
(0, vitest_1.describe)('Zod Validation Schemas', () => {
    (0, vitest_1.it)('accepts valid report submission with reporter consent', () => {
        const validData = {
            title: 'Water Main Rupture on Main St',
            rawDescription: 'Municipal pipe burst spraying water 15 feet into the air. Street flooding rapidly.',
            category: 'FLOOD',
            urgency: 'HIGH',
            locationName: 'Main St & 4th Ave',
            latitude: 37.7749,
            longitude: -122.4194,
            reporterConsent: true,
            reporterName: 'Jane Doe',
        };
        const result = validation_js_1.createReportSchema.safeParse(validData);
        (0, vitest_1.expect)(result.success).toBe(true);
    });
    (0, vitest_1.it)('rejects report submission if reporter consent is false or missing', () => {
        const invalidData = {
            title: 'Water Main Rupture on Main St',
            rawDescription: 'Municipal pipe burst spraying water 15 feet into the air.',
            locationName: 'Main St & 4th Ave',
            latitude: 37.7749,
            longitude: -122.4194,
            reporterConsent: false,
        };
        const result = validation_js_1.createReportSchema.safeParse(invalidData);
        (0, vitest_1.expect)(result.success).toBe(false);
        if (!result.success) {
            (0, vitest_1.expect)(result.error.errors[0].message).toContain('consent is required');
        }
    });
    (0, vitest_1.it)('validates report status update enum correctly', () => {
        (0, vitest_1.expect)(validation_js_1.updateReportStatusSchema.safeParse({ status: 'VERIFIED' }).success).toBe(true);
        (0, vitest_1.expect)(validation_js_1.updateReportStatusSchema.safeParse({ status: 'RESOLVED' }).success).toBe(true);
        (0, vitest_1.expect)(validation_js_1.updateReportStatusSchema.safeParse({ status: 'INVALID_STATUS' }).success).toBe(false);
    });
    (0, vitest_1.it)('requires review notes when ruling on duplicate suggestions', () => {
        const noNotes = { status: 'CONFIRMED_DUPLICATE', reviewNotes: '' };
        (0, vitest_1.expect)(validation_js_1.reviewDuplicateSchema.safeParse(noNotes).success).toBe(false);
        const withNotes = { status: 'CONFIRMED_DUPLICATE', reviewNotes: 'Verified same underpass flood incident.' };
        (0, vitest_1.expect)(validation_js_1.reviewDuplicateSchema.safeParse(withNotes).success).toBe(true);
    });
    (0, vitest_1.it)('validates help request schema and defaults urgency to MEDIUM', () => {
        const helpReq = {
            requestType: 'WATER',
            description: 'Need 50 gallons potable water for shelter',
            peopleCount: 25,
        };
        const result = validation_js_1.createHelpRequestSchema.safeParse(helpReq);
        (0, vitest_1.expect)(result.success).toBe(true);
        if (result.success) {
            (0, vitest_1.expect)(result.data.urgency).toBe('MEDIUM');
            (0, vitest_1.expect)(result.data.peopleCount).toBe(25);
        }
    });
});
