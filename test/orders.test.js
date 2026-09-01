import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/user.model.js';
import Order from '../src/models/order.model.js';

describe('Orders', () => {
  let customerId;
  let driverId;
  const createdOrderIds = [];
  const createdUserIds = [];

  before(async () => {
    const customer = await request(app).post('/api/users').send({
      firstName: 'Order', lastName: 'Customer', email: `order.customer.${Date.now()}@test.com`, password: 'secreta123'
    });
    customerId = customer.body._id;
    createdUserIds.push(customerId);

    const driver = await request(app).post('/api/users').send({
      firstName: 'Order', lastName: 'Driver', email: `order.driver.${Date.now()}@test.com`, password: 'secreta123', role: 'driver'
    });
    driverId = driver.body._id;
    createdUserIds.push(driverId);
  });

  after(async () => {
    await Order.deleteMany({ _id: { $in: createdOrderIds } });
    await User.deleteMany({ _id: { $in: createdUserIds } });
  });

  describe('GET /api/orders', () => {
    it('devuelve un array de pedidos', async () => {
      const res = await request(app).get('/api/orders');
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
    });
  });

  describe('POST /api/orders', () => {
    it('crea un pedido con datos validos', async () => {
      const res = await request(app).post('/api/orders').send({
        customer: customerId,
        items: [{ name: 'Caja', quantity: 2, price: 1000 }],
        deliveryAddress: 'Calle Falsa 123'
      });

      expect(res.status).to.equal(201);
      expect(res.body.order).to.include.all.keys('_id', 'status', 'total', 'priority');
      expect(res.body.order.status).to.equal('created');
      expect(res.body.order.total).to.equal(2000);
      expect(res.body).to.have.property('shippingCost');
      expect(res.body).to.have.property('message');

      createdOrderIds.push(res.body.order._id);
    });

    it('rechaza un pedido sin items', async () => {
      const res = await request(app).post('/api/orders').send({
        customer: customerId,
        items: [],
        deliveryAddress: 'Calle Falsa 123'
      });

      expect(res.status).to.equal(400);
      expect(res.body.error.code).to.equal('MISSING_FIELDS');
    });

    it('rechaza un cliente inexistente', async () => {
      const res = await request(app).post('/api/orders').send({
        customer: '000000000000000000000000',
        items: [{ name: 'Caja', quantity: 1, price: 500 }],
        deliveryAddress: 'Calle Falsa 123'
      });

      expect(res.status).to.equal(404);
      expect(res.body.error.code).to.equal('USER_NOT_FOUND');
    });

    it('no permite que un repartidor cree un pedido', async () => {
      const res = await request(app).post('/api/orders').send({
        customer: driverId,
        items: [{ name: 'Caja', quantity: 1, price: 500 }],
        deliveryAddress: 'Calle Falsa 123'
      });

      expect(res.status).to.equal(403);
      expect(res.body.error.code).to.equal('FORBIDDEN_ROLE');
    });
  });

  describe('GET /api/orders/:oid', () => {
    let orderId;

    before(async () => {
      const res = await request(app).post('/api/orders').send({
        customer: customerId,
        items: [{ name: 'Sobre', quantity: 1, price: 800 }],
        deliveryAddress: 'Calle Falsa 456'
      });
      orderId = res.body.order._id;
      createdOrderIds.push(orderId);
    });

    it('devuelve el pedido existente', async () => {
      const res = await request(app).get(`/api/orders/${orderId}`);
      expect(res.status).to.equal(200);
      expect(res.body._id).to.equal(orderId);
    });

    it('devuelve 404 si no existe', async () => {
      const res = await request(app).get('/api/orders/000000000000000000000000');
      expect(res.status).to.equal(404);
      expect(res.body.error.code).to.equal('ORDER_NOT_FOUND');
    });
  });

  describe('PATCH /api/orders/:oid/status', () => {
    let orderId;

    before(async () => {
      const res = await request(app).post('/api/orders').send({
        customer: customerId,
        items: [{ name: 'Paquete', quantity: 1, price: 1200 }],
        deliveryAddress: 'Calle Falsa 789'
      });
      orderId = res.body.order._id;
      createdOrderIds.push(orderId);
    });

    it('actualiza el estado a uno valido', async () => {
      const res = await request(app).patch(`/api/orders/${orderId}/status`).send({ status: 'assigned' });
      expect(res.status).to.equal(200);
      expect(res.body.status).to.equal('assigned');
    });

    it('rechaza un estado invalido', async () => {
      const res = await request(app).patch(`/api/orders/${orderId}/status`).send({ status: 'no-existe' });
      expect(res.status).to.equal(400);
      expect(res.body.error.code).to.equal('INVALID_STATUS');
    });

    it('rechaza si falta el estado', async () => {
      const res = await request(app).patch(`/api/orders/${orderId}/status`).send({});
      expect(res.status).to.equal(400);
      expect(res.body.error.code).to.equal('MISSING_FIELDS');
    });
  });

  describe('DELETE /api/orders/:oid', () => {
    it('elimina un pedido existente', async () => {
      const created = await request(app).post('/api/orders').send({
        customer: customerId,
        items: [{ name: 'Item', quantity: 1, price: 500 }],
        deliveryAddress: 'Calle Falsa 000'
      });

      const res = await request(app).delete(`/api/orders/${created.body.order._id}`);
      expect(res.status).to.equal(200);
      expect(res.body.message).to.equal('Pedido eliminado');
    });
  });
});
