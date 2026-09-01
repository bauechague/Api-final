import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app.js';

describe('Swagger docs', () => {
  it('sirve la UI de swagger en /api/docs', async () => {
    const res = await request(app).get('/api/docs/');
    expect(res.status).to.equal(200);
    expect(res.type).to.equal('text/html');
    expect(res.text).to.include('Swagger UI');
  });
});
