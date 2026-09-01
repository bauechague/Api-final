import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app.js';

describe('Logger', () => {
  describe('GET /api/logger/test', () => {
    it('genera logs de todos los niveles y responde ok', async () => {
      const res = await request(app).get('/api/logger/test');
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('message');
      expect(res.body.message).to.be.a('string');
    });
  });
});
