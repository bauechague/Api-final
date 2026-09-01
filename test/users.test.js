import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/user.model.js';

describe('Users', () => {
  const createdIds = [];

  after(async () => {
    await User.deleteMany({ _id: { $in: createdIds } });
  });

  describe('GET /api/users', () => {
    it('devuelve un array de usuarios', async () => {
      const res = await request(app).get('/api/users');
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
    });
  });

  describe('POST /api/users', () => {
    it('crea un usuario con datos validos', async () => {
      const res = await request(app).post('/api/users').send({
        firstName: 'Test',
        lastName: 'User',
        email: `test.user.${Date.now()}@test.com`,
        password: 'secreta123'
      });

      expect(res.status).to.equal(201);
      expect(res.body).to.include.all.keys('_id', 'firstName', 'lastName', 'email', 'role');
      expect(res.body).to.not.have.property('password');
      expect(res.body.role).to.equal('customer');

      createdIds.push(res.body._id);
    });

    it('rechaza datos incompletos', async () => {
      const res = await request(app).post('/api/users').send({ firstName: 'Solo Nombre' });

      expect(res.status).to.equal(400);
      expect(res.body.error.code).to.equal('MISSING_FIELDS');
    });

    it('no permite crear un usuario admin', async () => {
      const res = await request(app).post('/api/users').send({
        firstName: 'Admin',
        lastName: 'Test',
        email: `admin.test.${Date.now()}@test.com`,
        password: 'secreta123',
        role: 'admin'
      });

      expect(res.status).to.equal(403);
      expect(res.body.error.code).to.equal('FORBIDDEN_ROLE');
    });

    it('rechaza un email duplicado', async () => {
      const email = `dup.test.${Date.now()}@test.com`;

      const first = await request(app).post('/api/users').send({
        firstName: 'Dup', lastName: 'One', email, password: 'secreta123'
      });
      createdIds.push(first.body._id);

      const res = await request(app).post('/api/users').send({
        firstName: 'Dup', lastName: 'Two', email, password: 'secreta123'
      });

      expect(res.status).to.equal(409);
      expect(res.body.error.code).to.equal('EMAIL_ALREADY_REGISTERED');
    });
  });

  describe('GET /api/users/:uid', () => {
    let userId;

    before(async () => {
      const res = await request(app).post('/api/users').send({
        firstName: 'Get', lastName: 'ById', email: `get.byid.${Date.now()}@test.com`, password: 'secreta123'
      });
      userId = res.body._id;
      createdIds.push(userId);
    });

    it('devuelve el usuario existente', async () => {
      const res = await request(app).get(`/api/users/${userId}`);

      expect(res.status).to.equal(200);
      expect(res.body._id).to.equal(userId);
      expect(res.body.email).to.be.a('string');
    });

    it('devuelve 404 si no existe', async () => {
      const res = await request(app).get('/api/users/000000000000000000000000');

      expect(res.status).to.equal(404);
      expect(res.body.error.code).to.equal('USER_NOT_FOUND');
    });
  });

  describe('DELETE /api/users/:uid', () => {
    it('elimina un usuario existente', async () => {
      const created = await request(app).post('/api/users').send({
        firstName: 'Delete', lastName: 'Me', email: `delete.me.${Date.now()}@test.com`, password: 'secreta123'
      });

      const res = await request(app).delete(`/api/users/${created.body._id}`);

      expect(res.status).to.equal(200);
      expect(res.body.message).to.equal('Usuario eliminado');
    });

    it('devuelve 404 al eliminar un usuario inexistente', async () => {
      const res = await request(app).delete('/api/users/000000000000000000000000');

      expect(res.status).to.equal(404);
      expect(res.body.error.code).to.equal('USER_NOT_FOUND');
    });
  });
});
