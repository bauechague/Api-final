import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app.js';

describe('Ruta inexistente', () => {
  it('responde 404 con el formato de error estandar', async () => {
    const res = await request(app).get('/api/ruta-que-no-existe');
    expect(res.status).to.equal(404);
    expect(res.body.error.code).to.equal('ROUTE_NOT_FOUND');
    expect(res.body.error).to.have.property('message');
  });
});
