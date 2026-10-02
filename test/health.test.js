import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app.js';

describe('Health', () => {
  describe('GET /api/health', () => {
    it('responde ok con la base conectada', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).to.equal(200);
      expect(res.body.status).to.equal('ok');
      expect(res.body.db).to.equal('connected');
      expect(res.body).to.have.property('uptime');
      expect(res.body).to.have.property('timestamp');
    });
  });
});
