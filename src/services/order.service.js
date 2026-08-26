import orderRepository from '../repositories/order.repository.js';
import userRepository from '../repositories/user.repository.js';
import { CustomError } from '../errors/custom-error.js';
import logger from '../config/logger.config.js';
import { ROLES, ORDER_STATUS, PRIORITY } from '../constants/index.js';

class OrderService {
  async getAllOrders() {
    return orderRepository.findAll();
  }

  async getOrderById(id) {
    const order = await orderRepository.findById(id);
    if (!order) {
      throw new CustomError('ORDER_NOT_FOUND');
    }
    return order;
  }

  async createOrder({ customer, items, deliveryAddress, priority }) {
    if (!customer) {
      throw new CustomError('MISSING_FIELDS', 'Falta el cliente');
    }
    if (!items || items.length === 0) {
      throw new CustomError('MISSING_FIELDS', 'Faltan los items del pedido');
    }
    if (!deliveryAddress) {
      throw new CustomError('MISSING_FIELDS', 'Falta la direccion');
    }

    const user = await userRepository.findById(customer);
    if (!user) {
      throw new CustomError('USER_NOT_FOUND', 'El usuario no existe');
    }
    if (user.role === ROLES.DRIVER) {
      throw new CustomError('FORBIDDEN_ROLE', 'Los repartidores no pueden crear pedidos');
    }

    const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const newOrder = await orderRepository.create({
      customer,
      items,
      deliveryAddress,
      total,
      priority: priority || PRIORITY.NORMAL,
      status: ORDER_STATUS.CREATED
    });

    logger.debug(`[EMAIL SIMULADO] Enviando confirmacion al usuario ${customer}...`);
    logger.info(`Pedido ${newOrder._id} creado correctamente. Total: $${total}`);

    const shippingCost = newOrder.items.reduce((acc, item) => acc + item.quantity * 10, 0);

    return { order: newOrder, shippingCost };
  }

  async updateOrderStatus(id, status) {
    if (!status) {
      throw new CustomError('MISSING_FIELDS', 'El estado es obligatorio');
    }
    if (!Object.values(ORDER_STATUS).includes(status)) {
      throw new CustomError('INVALID_STATUS');
    }

    const order = await orderRepository.findById(id);
    if (!order) {
      throw new CustomError('ORDER_NOT_FOUND');
    }
    if (order.status === ORDER_STATUS.DELIVERED) {
      throw new CustomError('ORDER_ALREADY_DELIVERED');
    }

    const updatedOrder = await orderRepository.updateById(id, { status });
    logger.info(`Pedido ${updatedOrder._id} actualizado a estado: ${status}`);
    return updatedOrder;
  }

  async deleteOrder(id) {
    const deletedOrder = await orderRepository.deleteById(id);
    if (!deletedOrder) {
      throw new CustomError('ORDER_NOT_FOUND');
    }
    return deletedOrder;
  }
}

export default new OrderService();
