import healthService from '../services/health.service.js';

class HealthController {
  check(req, res) {
    const { ok, status, uptime, db, timestamp } = healthService.getStatus();

    res.status(ok ? 200 : 503).json({ status, uptime, db, timestamp });
  }
}

export default new HealthController();
