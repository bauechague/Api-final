import { expect } from 'chai';
import request from 'supertest';
import fs from 'fs';
import app from '../src/app.js';
import User from '../src/models/user.model.js';
import Order from '../src/models/order.model.js';
import Delivery from '../src/models/delivery.model.js';

const PDF_BUFFER = Buffer.from('%PDF-1.4 contenido de prueba');

describe('Uploads', () => {
  let customerId;
  let driverId;
  const createdUserIds = [];
  const createdOrderIds = [];
  const createdDeliveryIds = [];
  const createdFilePaths = [];

  before(async () => {
    const customer = await request(app).post('/api/users').send({
      firstName: 'Upload', lastName: 'Customer', email: `upload.customer.${Date.now()}@test.com`, password: 'secreta123'
    });
    customerId = customer.body._id;
    createdUserIds.push(customerId);

    const driver = await request(app).post('/api/users').send({
      firstName: 'Upload', lastName: 'Driver', email: `upload.driver.${Date.now()}@test.com`, password: 'secreta123', role: 'driver'
    });
    driverId = driver.body._id;
    createdUserIds.push(driverId);
  });

  after(async () => {
    await Delivery.deleteMany({ _id: { $in: createdDeliveryIds } });
    await Order.deleteMany({ _id: { $in: createdOrderIds } });
    await User.deleteMany({ _id: { $in: createdUserIds } });
    createdFilePaths.forEach((filePath) => {
      try {
        fs.unlinkSync(filePath);
      } catch {}
    });
  });

  async function createDelivery() {
    const order = await request(app).post('/api/orders').send({
      customer: customerId,
      items: [{ name: 'Caja', quantity: 1, price: 1000 }],
      deliveryAddress: 'Calle Falsa 123'
    });
    createdOrderIds.push(order.body.order._id);

    const delivery = await request(app).post('/api/deliveries').send({
      order: order.body.order._id,
      driver: driverId
    });
    createdDeliveryIds.push(delivery.body._id);
    return delivery.body._id;
  }

  describe('POST /api/users/:uid/documents', () => {
    it('carga un documento y lo asocia al usuario', async () => {
      const res = await request(app)
        .post(`/api/users/${customerId}/documents`)
        .field('documentType', 'license')
        .attach('file', PDF_BUFFER, 'licencia.pdf');

      expect(res.status).to.equal(201);
      expect(res.body.documents).to.have.lengthOf(1);
      expect(res.body.documents[0]).to.include.all.keys(
        'originalName', 'generatedName', 'path', 'mimeType', 'size', 'documentType', 'uploadedAt'
      );
      expect(res.body.documents[0].documentType).to.equal('license');

      createdFilePaths.push(res.body.documents[0].path);
    });

    it('rechaza la carga sin archivo', async () => {
      const res = await request(app)
        .post(`/api/users/${customerId}/documents`)
        .field('documentType', 'license');

      expect(res.status).to.equal(400);
      expect(res.body.error.code).to.equal('FILE_REQUIRED');
    });

    it('rechaza un tipo de documento invalido', async () => {
      const res = await request(app)
        .post(`/api/users/${customerId}/documents`)
        .field('documentType', 'no-existe')
        .attach('file', PDF_BUFFER, 'licencia.pdf');

      expect(res.status).to.equal(400);
      expect(res.body.error.code).to.equal('INVALID_DOCUMENT_TYPE');

      if (res.body.documents) {
        createdFilePaths.push(...res.body.documents.map((d) => d.path));
      }
    });

    it('rechaza un tipo de archivo no permitido', async () => {
      const res = await request(app)
        .post(`/api/users/${customerId}/documents`)
        .field('documentType', 'license')
        .attach('file', Buffer.from('hola'), 'nota.txt');

      expect(res.status).to.equal(400);
      expect(res.body.error.code).to.equal('INVALID_FILE_TYPE');
    });

    it('rechaza la carga si el usuario no existe', async () => {
      const res = await request(app)
        .post('/api/users/000000000000000000000000/documents')
        .field('documentType', 'license')
        .attach('file', PDF_BUFFER, 'licencia.pdf');

      expect(res.status).to.equal(404);
      expect(res.body.error.code).to.equal('USER_NOT_FOUND');
    });
  });

  describe('POST /api/deliveries/:did/receipt', () => {
    it('carga un comprobante y lo asocia a la entrega', async () => {
      const deliveryId = await createDelivery();

      const res = await request(app)
        .post(`/api/deliveries/${deliveryId}/receipt`)
        .attach('file', PDF_BUFFER, 'comprobante.pdf');

      expect(res.status).to.equal(201);
      expect(res.body._id).to.equal(deliveryId);
      expect(res.body.receipt).to.include.all.keys(
        'originalName', 'generatedName', 'path', 'mimeType', 'size', 'uploadedAt'
      );

      createdFilePaths.push(res.body.receipt.path);
    });

    it('rechaza la carga sin archivo', async () => {
      const deliveryId = await createDelivery();

      const res = await request(app).post(`/api/deliveries/${deliveryId}/receipt`);

      expect(res.status).to.equal(400);
      expect(res.body.error.code).to.equal('FILE_REQUIRED');
    });

    it('rechaza la carga si la entrega no existe', async () => {
      const res = await request(app)
        .post('/api/deliveries/000000000000000000000000/receipt')
        .attach('file', PDF_BUFFER, 'comprobante.pdf');

      expect(res.status).to.equal(404);
      expect(res.body.error.code).to.equal('DELIVERY_NOT_FOUND');
    });
  });
});
