import { describe, it, expect } from 'vitest';
import {
  createReportSchema,
  updateReportStatusSchema,
  createHelpRequestSchema,
  reviewDuplicateSchema,
} from '../middleware/validation.js';

describe('Zod Validation Schemas', () => {
  it('accepts valid report submission with reporter consent', () => {
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

    const result = createReportSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects report submission if reporter consent is false or missing', () => {
    const invalidData = {
      title: 'Water Main Rupture on Main St',
      rawDescription: 'Municipal pipe burst spraying water 15 feet into the air.',
      locationName: 'Main St & 4th Ave',
      latitude: 37.7749,
      longitude: -122.4194,
      reporterConsent: false,
    };

    const result = createReportSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('consent is required');
    }
  });

  it('validates report status update enum correctly', () => {
    expect(updateReportStatusSchema.safeParse({ status: 'VERIFIED' }).success).toBe(true);
    expect(updateReportStatusSchema.safeParse({ status: 'RESOLVED' }).success).toBe(true);
    expect(updateReportStatusSchema.safeParse({ status: 'INVALID_STATUS' }).success).toBe(false);
  });

  it('requires review notes when ruling on duplicate suggestions', () => {
    const noNotes = { status: 'CONFIRMED_DUPLICATE', reviewNotes: '' };
    expect(reviewDuplicateSchema.safeParse(noNotes).success).toBe(false);

    const withNotes = { status: 'CONFIRMED_DUPLICATE', reviewNotes: 'Verified same underpass flood incident.' };
    expect(reviewDuplicateSchema.safeParse(withNotes).success).toBe(true);
  });

  it('validates help request schema and defaults urgency to MEDIUM', () => {
    const helpReq = {
      requestType: 'WATER',
      description: 'Need 50 gallons potable water for shelter',
      peopleCount: 25,
    };

    const result = createHelpRequestSchema.safeParse(helpReq);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.urgency).toBe('MEDIUM');
      expect(result.data.peopleCount).toBe(25);
    }
  });
});
