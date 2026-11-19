"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const index_js_1 = __importDefault(require("../index.js"));
const aiInterpreter_js_1 = require("../services/aiInterpreter.js");
(0, vitest_1.describe)('ResQNet API & Services', () => {
    (0, vitest_1.it)('initializes Express app successfully', () => {
        (0, vitest_1.expect)(index_js_1.default).toBeDefined();
    });
    (0, vitest_1.it)('interprets natural language emergency report accurately', async () => {
        const rawText = 'Severe water rising at the Maple Ave underpass. Two cars are stuck in deep floodwater with drivers waving for help.';
        const analysis = await (0, aiInterpreter_js_1.interpretIncidentReport)(rawText, 'Maple Ave Underpass', 'FLOOD');
        (0, vitest_1.expect)(analysis.extractedCategory).toBe('FLOOD');
        (0, vitest_1.expect)(analysis.extractedNeeds).toContain('swift_water_rescue');
        (0, vitest_1.expect)(analysis.structuredSummary).toBeDefined();
        (0, vitest_1.expect)(analysis.urgencyRationale).toContain('decision-support');
        (0, vitest_1.expect)(analysis.confidenceScore).toBeGreaterThan(0.7);
        (0, vitest_1.expect)(analysis.isVerified).toBe(false);
    });
});
