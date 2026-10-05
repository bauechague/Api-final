import mongoose from 'mongoose';
import config from '../config/env.config.js';

class HealthService {
  getStatus() {
    const dbConnected = mongoose.connection.readyState === 1;

    return {
      ok: dbConnected,
      status: dbConnected ? 'ok' : 'error',
      environment: config.nodeEnv,
      uptime: process.uptime(),
      db: dbConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    };
  }
}

export default new HealthService();
