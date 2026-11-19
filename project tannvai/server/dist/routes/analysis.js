"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analysisRouter = void 0;
const express_1 = require("express");
const aiInterpreter_js_1 = require("../services/aiInterpreter.js");
const db_js_1 = require("../services/db.js");
exports.analysisRouter = (0, express_1.Router)();
/**
 * POST /api/analysis/interpret
 * Real-time pre-submission or testing interpretation of natural language text
 */
exports.analysisRouter.post('/interpret', async (req, res) => {
    try {
        const { text, location, category } = req.body;
        if (!text || typeof text !== 'string' || text.trim().length < 5) {
            return res.status(400).json({ error: 'Text must be at least 5 characters long for analysis.' });
        }
        const analysis = await (0, aiInterpreter_js_1.interpretIncidentReport)(text, location, category);
        res.json({
            success: true,
            analysis,
        });
    }
    catch (err) {
        console.error('Error during real-time interpretation:', err);
        res.status(500).json({ error: 'Analysis failed', details: err.message });
    }
});
/**
 * GET /api/analysis/:reportId
 * Retrieve stored AI analysis for a specific incident report
 */
exports.analysisRouter.get('/:reportId', async (req, res) => {
    try {
        const reportId = String(req.params.reportId);
        const analysis = await db_js_1.prisma.incidentAnalysis.findUnique({
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
    }
    catch (err) {
        console.error('Error fetching analysis:', err);
        res.status(500).json({ error: 'Failed to retrieve analysis', details: err.message });
    }
});
