import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  sessionSecret: process.env.SESSION_SECRET || 'resqnet-ai-hackathon-demo-secret-key-321',
  isDemoMode: !process.env.GEMINI_API_KEY,
};
