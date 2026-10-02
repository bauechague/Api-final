import mongoose from 'mongoose';

class HealthController {
  check(req, res) {
    const dbConnected = mongoose.connection.readyState === 1;

    res.status(dbConnected ? 200 : 503).json({
      status: dbConnected ? 'ok' : 'error',
      uptime: process.uptime(),
      db: dbConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
  }
}

export default new HealthController();
