import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/user.model.js';

describe('Mocks', () => {
  const createdUserIds = [];

  after(async () => {
    await User.deleteMany({ _id: { $in: createdUserIds } });
  });

  describe('GET /api/mocks/users', () => {
    it('genera usuarios simulados sin guardarlos', async () => {
      const res = await request(app).get('/api/mocks/users?qty=3');

      expect(res.status).to.equal(200);
      expect(res.body).to.have.lengthOf(3);
      expect(res.body[0]).to.include.all.keys('firstName', 'lastName', 'email', 'role');

      const found = await User.findOne({ email: res.body[0].email });
      expect(found).to.equal(null);
    });

    it('rechaza una cantidad invalida', async () => {
      const res = await request(app).get('/api/mocks/users?qty=-5');
      expect(res.status).to.equal(400);
      expect(res.body.error.code).to.equal('INVALID_MOCK_QTY');
    });

    it('no permite simular un usuario admin', async () => {
      const res = await request(app).get('/api/mocks/users?role=admin');
      expect(res.status).to.equal(403);
      expect(res.body.error.code).to.equal('FORBIDDEN_ROLE');
    });
  });

  describe('GET /api/mocks/orders', () => {
    it('genera pedidos simulados', async () => {
      const res = await request(app).get('/api/mocks/orders?qty=2');
      expect(res.status).to.equal(200);
      expect(res.body).to.have.lengthOf(2);
      expect(res.body[0]).to.include.all.keys('items', 'total', 'status', 'priority');
    });
  });

  describe('GET /api/mocks/deliveries', () => {
    it('genera entregas simuladas asociadas a un pedido y un repartidor', async () => {
      const res = await request(app).get('/api/mocks/deliveries?qty=2');
      expect(res.status).to.equal(200);
      expect(res.body).to.have.lengthOf(2);
      expect(res.body[0]).to.include.all.keys('order', 'driver', 'status', 'priority');
    });
  });

  describe('POST /api/mocks/seed', () => {
    it('inserta usuarios de prueba en Mongo', async () => {
      const res = await request(app).post('/api/mocks/seed?type=users&qty=3');

      expect(res.status).to.equal(201);
      expect(res.body).to.deep.equal({ insertados: 3, coleccion: 'usuarios' });

      const inserted = await User.find().sort({ createdAt: -1 }).limit(3);
      expect(inserted).to.have.lengthOf(3);
      createdUserIds.push(...inserted.map((u) => u._id));
    });

    it('rechaza un tipo de coleccion invalido', async () => {
      const res = await request(app).post('/api/mocks/seed?type=noexiste');
      expect(res.status).to.equal(400);
      expect(res.body.error.code).to.equal('INVALID_MOCK_TYPE');
    });

    it('rechaza una cantidad invalida', async () => {
      const res = await request(app).post('/api/mocks/seed?qty=abc');
      expect(res.status).to.equal(400);
      expect(res.body.error.code).to.equal('INVALID_MOCK_QTY');
    });
  });
});
