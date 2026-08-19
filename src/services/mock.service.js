import mongoose from 'mongoose';
import mockRepository from '../repositories/mock.repository.js';
import { createHttpError } from '../utils/http-error.js';
import { randomInt, randomItem, randomSuffix } from '../utils/random.util.js';
import { ROLES, ORDER_STATUS, DELIVERY_STATUS, PRIORITY } from '../constants/index.js';

const FIRST_NAMES = ['Ana', 'Luis', 'Carla', 'Diego', 'Marta', 'Pablo', 'Sofia', 'Juan', 'Valentina', 'Nicolas', 'Camila', 'Mateo', 'Lucia', 'Franco', 'Julieta', 'Bruno'];
const LAST_NAMES = ['Perez', 'Gomez', 'Rodriguez', 'Fernandez', 'Lopez', 'Diaz', 'Martinez', 'Sanchez', 'Romero', 'Torres', 'Flores', 'Acosta'];
const STREETS = ['Av. Corrientes', 'Calle San Martin', 'Av. Rivadavia', 'Bv. Mitre', 'Calle Belgrano', 'Av. Colon', 'Ruta 9 Km 12'];
const ITEM_NAMES = ['Caja chica', 'Paquete mediano', 'Sobre de documentos', 'Electrodomestico', 'Indumentaria', 'Libros', 'Accesorios', 'Herramientas'];

const ASSIGNABLE_ROLES = [ROLES.CUSTOMER, ROLES.DRIVER, ROLES.STORE];

function slugify(text) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

function generateUser(role) {
  const firstName = randomItem(FIRST_NAMES);
  const lastName = randomItem(LAST_NAMES);
  const email = `${slugify(firstName)}.${slugify(lastName)}.${randomSuffix()}@test.com`;

  return {
    _id: new mongoose.Types.ObjectId(),
    firstName,
    lastName,
    email,
    password: `Mock${randomInt(1000, 9999)}`,
    role: role || randomItem(ASSIGNABLE_ROLES)
  };
}

function generateOrder(customer, status = ORDER_STATUS.CREATED) {
  const itemCount = randomInt(1, 3);
  const items = Array.from({ length: itemCount }, () => ({
    name: randomItem(ITEM_NAMES),
    quantity: randomInt(1, 5),
    price: randomInt(500, 20000)
  }));
  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return {
    _id: new mongoose.Types.ObjectId(),
    customer: customer._id,
    items,
    deliveryAddress: `${randomItem(STREETS)} ${randomInt(1, 3000)}`,
    total,
    status,
    priority: randomItem(Object.values(PRIORITY)),
    delivery: null
  };
}

function generateDelivery(order, driver, status = DELIVERY_STATUS.ASSIGNED) {
  return {
    _id: new mongoose.Types.ObjectId(),
    order: order._id,
    driver: driver ? driver._id : null,
    status,
    priority: randomItem(Object.values(PRIORITY)),
    assignedAt: status !== DELIVERY_STATUS.PENDING ? new Date() : null,
    deliveredAt: status === DELIVERY_STATUS.DELIVERED ? new Date() : null
  };
}

function stripId({ _id, ...rest }) {
  return rest;
}

class MockService {
  getMockUsers(qty, role) {
    if (role && !Object.values(ROLES).includes(role)) {
      throw createHttpError(400, `Rol invalido: ${role}`);
    }
    if (role === ROLES.ADMIN) {
      throw createHttpError(403, 'No se pueden simular usuarios admin');
    }

    return Array.from({ length: qty }, () => generateUser(role));
  }

  getMockOrders(qty) {
    return Array.from({ length: qty }, () => {
      const customer = generateUser(ROLES.CUSTOMER);
      return generateOrder(customer, randomItem(Object.values(ORDER_STATUS)));
    });
  }

  getMockDeliveries(qty) {
    return Array.from({ length: qty }, () => {
      const customer = generateUser(ROLES.CUSTOMER);
      const order = generateOrder(customer, ORDER_STATUS.ASSIGNED);
      const driver = generateUser(ROLES.DRIVER);
      return generateDelivery(order, driver, randomItem(Object.values(DELIVERY_STATUS)));
    });
  }

  async seedUsers(qty) {
    const users = this.getMockUsers(qty).map(stripId);
    const inserted = await mockRepository.insertUsers(users);
    return { insertados: inserted.length, coleccion: 'usuarios' };
  }

  async seedOrders(qty) {
    let customers = await mockRepository.findUsersExcludingRole(ROLES.DRIVER, qty);
    if (customers.length < qty) {
      const missing = qty - customers.length;
      const newCustomers = this.getMockUsers(missing, ROLES.CUSTOMER).map(stripId);
      const insertedCustomers = await mockRepository.insertUsers(newCustomers);
      customers = customers.concat(insertedCustomers);
    }

    const orders = Array.from({ length: qty }, () => {
      const customer = randomItem(customers);
      return stripId(generateOrder(customer, ORDER_STATUS.CREATED));
    });

    const inserted = await mockRepository.insertOrders(orders);
    return { insertados: inserted.length, coleccion: 'pedidos' };
  }

  async seedDeliveries(qty) {
    let availableOrders = await mockRepository.findOrdersByStatus(ORDER_STATUS.CREATED, qty);
    if (availableOrders.length < qty) {
      const missing = qty - availableOrders.length;
      await this.seedOrders(missing);
      const extraOrders = await mockRepository.findOrdersByStatus(ORDER_STATUS.CREATED, missing);
      availableOrders = availableOrders.concat(extraOrders);
    }

    let drivers = await mockRepository.findUsersByRole(ROLES.DRIVER, qty);
    if (drivers.length < qty) {
      const missing = qty - drivers.length;
      const newDrivers = this.getMockUsers(missing, ROLES.DRIVER).map(stripId);
      const insertedDrivers = await mockRepository.insertUsers(newDrivers);
      drivers = drivers.concat(insertedDrivers);
    }

    const deliveries = availableOrders.slice(0, qty).map((order, index) => {
      const driver = drivers[index % drivers.length];
      return stripId(generateDelivery(order, driver, DELIVERY_STATUS.ASSIGNED));
    });

    const inserted = await mockRepository.insertDeliveries(deliveries);
    await Promise.all(inserted.map((delivery) =>
      mockRepository.linkDeliveryToOrder(delivery.order, delivery._id, ORDER_STATUS.ASSIGNED)
    ));

    return { insertados: inserted.length, coleccion: 'entregas' };
  }

  async seedAll(qty) {
    const usuarios = await this.seedUsers(qty);
    const pedidos = await this.seedOrders(qty);
    const entregas = await this.seedDeliveries(qty);
    return { usuarios, pedidos, entregas };
  }

  async seed(type, qty) {
    switch (type) {
      case 'users':
        return this.seedUsers(qty);
      case 'orders':
        return this.seedOrders(qty);
      case 'deliveries':
        return this.seedDeliveries(qty);
      case 'all':
        return this.seedAll(qty);
      default:
        throw createHttpError(400, `Tipo de coleccion invalido: ${type}`);
    }
  }
}

export default new MockService();
