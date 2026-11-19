import { describe, it, expect } from 'vitest';
import app from '../index.js';
import { interpretIncidentReport } from '../services/aiInterpreter.js';

describe('ResQNet API & Services', () => {
  it('initializes Express app successfully', () => {
    expect(app).toBeDefined();
  });

  it('interprets natural language emergency report accurately', async () => {
    const rawText = 'Severe water rising at the Maple Ave underpass. Two cars are stuck in deep floodwater with drivers waving for help.';
    const analysis = await interpretIncidentReport(rawText, 'Maple Ave Underpass', 'FLOOD');

    expect(analysis.extractedCategory).toBe('FLOOD');
    expect(analysis.extractedNeeds).toContain('swift_water_rescue');
    expect(analysis.structuredSummary).toBeDefined();
    expect(analysis.urgencyRationale).toContain('decision-support');
    expect(analysis.confidenceScore).toBeGreaterThan(0.7);
    expect(analysis.isVerified).toBe(false);
  });
});
