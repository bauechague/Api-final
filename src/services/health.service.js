import mongoose from 'mongoose';

class HealthService {
  getStatus() {
    const dbConnected = mongoose.connection.readyState === 1;

    return {
      ok: dbConnected,
      status: dbConnected ? 'ok' : 'error',
      uptime: process.uptime(),
      db: dbConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    };
  }
}

export default new HealthService();
