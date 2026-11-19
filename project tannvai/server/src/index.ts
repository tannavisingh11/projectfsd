import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config.js';
import { authMiddleware } from './middleware/auth.js';
import { reportsRouter } from './routes/reports.js';
import { analysisRouter } from './routes/analysis.js';
import { duplicatesRouter } from './routes/duplicates.js';
import { resourcesRouter } from './routes/resources.js';
import { requestsRouter } from './routes/requests.js';
import { statsRouter } from './routes/stats.js';
import { auditRouter } from './routes/audit.js';
import { demoRouter } from './routes/demo.js';

const app = express();

// Security and parsing middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-role', 'x-user-id', 'x-user-name'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Role & Session Simulation Middleware
app.use(authMiddleware);

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    system: 'ResQNet AI — Community Emergency Intelligence Network',
    version: '1.0.0',
    mode: config.isDemoMode ? 'DEMO_NLP_SIMULATION' : 'ONLINE_GEMINI_AI',
    model: config.geminiModel,
    timestamp: new Date().toISOString(),
  });
});

// Mount modular API routers
app.use('/api/reports', reportsRouter);
app.use('/api/analysis', analysisRouter);
app.use('/api/duplicates', duplicatesRouter);
app.use('/api/resources', resourcesRouter);
app.use('/api/requests', requestsRouter);
app.use('/api/stats', statsRouter);
app.use('/api/audit', auditRouter);
app.use('/api/demo', demoRouter);

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('🔥 Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(config.nodeEnv === 'development' ? { stack: err.stack } : {}),
  });
});

// Start Express Listener only when not testing
if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`================================================================`);
    console.log(`🚨 ResQNet AI Emergency Intelligence Backend is running!`);
    console.log(`🌐 Listening on: http://localhost:${config.port}`);
    console.log(`🧠 AI Engine Mode: ${config.isDemoMode ? 'Explainable Deterministic NLP (Demo Mode)' : `Gemini API (${config.geminiModel})`}`);
    console.log(`🛡️ Database: SQLite / Prisma`);
    console.log(`================================================================`);
  });
}

export default app;
