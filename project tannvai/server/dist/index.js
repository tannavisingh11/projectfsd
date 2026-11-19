"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const config_js_1 = require("./config.js");
const auth_js_1 = require("./middleware/auth.js");
const reports_js_1 = require("./routes/reports.js");
const analysis_js_1 = require("./routes/analysis.js");
const duplicates_js_1 = require("./routes/duplicates.js");
const resources_js_1 = require("./routes/resources.js");
const requests_js_1 = require("./routes/requests.js");
const stats_js_1 = require("./routes/stats.js");
const audit_js_1 = require("./routes/audit.js");
const demo_js_1 = require("./routes/demo.js");
const app = (0, express_1.default)();
// Security and parsing middleware
app.use((0, cors_1.default)({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-role', 'x-user-id', 'x-user-name'],
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Role & Session Simulation Middleware
app.use(auth_js_1.authMiddleware);
// Health check endpoint
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'healthy',
        system: 'ResQNet AI — Community Emergency Intelligence Network',
        version: '1.0.0',
        mode: config_js_1.config.isDemoMode ? 'DEMO_NLP_SIMULATION' : 'ONLINE_GEMINI_AI',
        model: config_js_1.config.geminiModel,
        timestamp: new Date().toISOString(),
    });
});
// Mount modular API routers
app.use('/api/reports', reports_js_1.reportsRouter);
app.use('/api/analysis', analysis_js_1.analysisRouter);
app.use('/api/duplicates', duplicates_js_1.duplicatesRouter);
app.use('/api/resources', resources_js_1.resourcesRouter);
app.use('/api/requests', requests_js_1.requestsRouter);
app.use('/api/stats', stats_js_1.statsRouter);
app.use('/api/audit', audit_js_1.auditRouter);
app.use('/api/demo', demo_js_1.demoRouter);
// Global Error Handler
app.use((err, _req, res, _next) => {
    console.error('🔥 Unhandled Server Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        ...(config_js_1.config.nodeEnv === 'development' ? { stack: err.stack } : {}),
    });
});
// Start Express Listener only when not testing
if (process.env.NODE_ENV !== 'test') {
    app.listen(config_js_1.config.port, () => {
        console.log(`================================================================`);
        console.log(`🚨 ResQNet AI Emergency Intelligence Backend is running!`);
        console.log(`🌐 Listening on: http://localhost:${config_js_1.config.port}`);
        console.log(`🧠 AI Engine Mode: ${config_js_1.config.isDemoMode ? 'Explainable Deterministic NLP (Demo Mode)' : `Gemini API (${config_js_1.config.geminiModel})`}`);
        console.log(`🛡️ Database: SQLite / Prisma`);
        console.log(`================================================================`);
    });
}
exports.default = app;
