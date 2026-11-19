import { Router, Request, Response } from 'express';
import { interpretIncidentReport } from '../services/aiInterpreter.js';
import { prisma } from '../services/db.js';

export const analysisRouter = Router();

/**
 * POST /api/analysis/interpret
 * Real-time pre-submission or testing interpretation of natural language text
 */
analysisRouter.post('/interpret', async (req: Request, res: Response) => {
  try {
    const { text, location, category } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length < 5) {
      return res.status(400).json({ error: 'Text must be at least 5 characters long for analysis.' });
    }

    const analysis = await interpretIncidentReport(text, location, category);

    res.json({
      success: true,
      analysis,
    });
  } catch (err: any) {
    console.error('Error during real-time interpretation:', err);
    res.status(500).json({ error: 'Analysis failed', details: err.message });
  }
});

/**
 * GET /api/analysis/:reportId
 * Retrieve stored AI analysis for a specific incident report
 */
analysisRouter.get('/:reportId', async (req: Request, res: Response) => {
  try {
    const reportId = String(req.params.reportId);
    const analysis = await prisma.incidentAnalysis.findUnique({
      where: { reportId },
      include: {
        report: {
          select: {
            id: true,
            title: true,
            rawDescription: true,
            status: true,
            urgency: true,
            createdAt: true,
          },
        },
      },
    });

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis record not found for this report.' });
    }

    res.json({ analysis });
  } catch (err: any) {
    console.error('Error fetching analysis:', err);
    res.status(500).json({ error: 'Failed to retrieve analysis', details: err.message });
  }
});
