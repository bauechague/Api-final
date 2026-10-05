import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/user.model.js';
import Order from '../src/models/order.model.js';
import Delivery from '../src/models/delivery.model.js';

describe('Deliveries', () => {
  let customerId;
  let driverId;
  const createdUserIds = [];
  const createdOrderIds = [];
  const createdDeliveryIds = [];

  before(async () => {
    const customer = await request(app).post('/api/users').send({
      firstName: 'Delivery', lastName: 'Customer', email: `delivery.customer.${Date.now()}@test.com`, password: 'secreta123'
    });
    customerId = customer.body._id;
    createdUserIds.push(customerId);

    const driver = await request(app).post('/api/users').send({
      firstName: 'Delivery', lastName: 'Driver', email: `delivery.driver.${Date.now()}@test.com`, password: 'secreta123', role: 'driver'
    });
    driverId = driver.body._id;
    createdUserIds.push(driverId);
  });

  after(async () => {
    await Delivery.deleteMany({ _id: { $in: createdDeliveryIds } });
    await Order.deleteMany({ _id: { $in: createdOrderIds } });
    await User.deleteMany({ _id: { $in: createdUserIds } });
  });

  async function createOrder() {
    const res = await request(app).post('/api/orders').send({
      customer: customerId,
      items: [{ name: 'Caja', quantity: 1, price: 1000 }],
      deliveryAddress: 'Calle Falsa 123'
    });
    createdOrderIds.push(res.body.order._id);
    return res.body.order._id;
  }

  describe('GET /api/deliveries', () => {
    it('devuelve un array de entregas', async () => {
      const res = await request(app).get('/api/deliveries');
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
    });

    it('respeta limit y page', async () => {
      const res = await request(app).get('/api/deliveries?limit=1&page=1');
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array').with.length.at.most(1);
    });

    it('rechaza un limit no numerico', async () => {
      const res = await request(app).get('/api/deliveries?limit=abc');
      expect(res.status).to.equal(400);
      expect(res.body.error.code).to.equal('INVALID_PAGINATION');
    });
  });

  describe('POST /api/deliveries', () => {
    it('crea una entrega con datos validos', async () => {
      const orderId = await createOrder();

      const res = await request(app).post('/api/deliveries').send({
        order: orderId,
        driver: driverId
      });

      expect(res.status).to.equal(201);
      expect(res.body).to.include.all.keys('_id', 'order', 'driver', 'status', 'priority');
      expect(res.body.status).to.equal('assigned');
      expect(res.body.order).to.equal(orderId);

      createdDeliveryIds.push(res.body._id);
    });

    it('rechaza un pedido inexistente', async () => {
      const res = await request(app).post('/api/deliveries').send({
        order: '000000000000000000000000',
        driver: driverId
      });

      expect(res.status).to.equal(404);
      expect(res.body.error.code).to.equal('ORDER_NOT_FOUND');
    });

    it('rechaza un repartidor que no tiene ese rol', async () => {
      const orderId = await createOrder();

      const res = await request(app).post('/api/deliveries').send({
        order: orderId,
        driver: customerId
      });

      expect(res.status).to.equal(400);
      expect(res.body.error.code).to.equal('INVALID_ROLE');
    });

    it('rechaza un pedido que ya tiene entrega asignada', async () => {
      const orderId = await createOrder();

      const first = await request(app).post('/api/deliveries').send({ order: orderId, driver: driverId });
      createdDeliveryIds.push(first.body._id);

      const res = await request(app).post('/api/deliveries').send({ order: orderId, driver: driverId });

      expect(res.status).to.equal(409);
      expect(res.body.error.code).to.equal('ORDER_ALREADY_PROCESSED');
    });
  });

  describe('GET /api/deliveries/:did', () => {
    let deliveryId;

    before(async () => {
      const orderId = await createOrder();
      const res = await request(app).post('/api/deliveries').send({ order: orderId, driver: driverId });
      deliveryId = res.body._id;
      createdDeliveryIds.push(deliveryId);
    });

    it('devuelve la entrega existente', async () => {
      const res = await request(app).get(`/api/deliveries/${deliveryId}`);
      expect(res.status).to.equal(200);
      expect(res.body._id).to.equal(deliveryId);
    });

    it('devuelve 404 si no existe', async () => {
      const res = await request(app).get('/api/deliveries/000000000000000000000000');
      expect(res.status).to.equal(404);
      expect(res.body.error.code).to.equal('DELIVERY_NOT_FOUND');
    });
  });

  describe('PATCH /api/deliveries/:did/status', () => {
    let deliveryId;

    before(async () => {
      const orderId = await createOrder();
      const res = await request(app).post('/api/deliveries').send({ order: orderId, driver: driverId });
      deliveryId = res.body._id;
      createdDeliveryIds.push(deliveryId);
    });

    it('actualiza el estado a uno valido', async () => {
      const res = await request(app).patch(`/api/deliveries/${deliveryId}/status`).send({ status: 'in_transit' });
      expect(res.status).to.equal(200);
      expect(res.body.status).to.equal('in_transit');
    });

    it('rechaza un estado invalido', async () => {
      const res = await request(app).patch(`/api/deliveries/${deliveryId}/status`).send({ status: 'no-existe' });
      expect(res.status).to.equal(400);
      expect(res.body.error.code).to.equal('INVALID_STATUS');
    });
  });

  describe('DELETE /api/deliveries/:did', () => {
    it('elimina una entrega existente', async () => {
      const orderId = await createOrder();
      const created = await request(app).post('/api/deliveries').send({ order: orderId, driver: driverId });

      const res = await request(app).delete(`/api/deliveries/${created.body._id}`);
      expect(res.status).to.equal(200);
      expect(res.body.message).to.equal('Entrega eliminada');
    });
  });
});
