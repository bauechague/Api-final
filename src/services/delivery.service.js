import deliveryRepository from '../repositories/delivery.repository.js';
import orderRepository from '../repositories/order.repository.js';
import userRepository from '../repositories/user.repository.js';
import { CustomError } from '../errors/custom-error.js';
import logger from '../config/logger.config.js';
import { ROLES, ORDER_STATUS, DELIVERY_STATUS, PRIORITY } from '../constants/index.js';

class DeliveryService {
  async getAllDeliveries() {
    return deliveryRepository.findAll();
  }

  async getDeliveryById(id) {
    const delivery = await deliveryRepository.findById(id);
    if (!delivery) {
      throw new CustomError('DELIVERY_NOT_FOUND');
    }
    return delivery;
  }

  async createDelivery({ order, driver, priority }) {
    if (!order) {
      throw new CustomError('MISSING_FIELDS', 'El pedido es obligatorio');
    }
    if (!driver) {
      throw new CustomError('MISSING_FIELDS', 'El repartidor es obligatorio');
    }

    const existingOrder = await orderRepository.findById(order);
    if (!existingOrder) {
      throw new CustomError('ORDER_NOT_FOUND', 'El pedido no existe');
    }

    const existingDriver = await userRepository.findById(driver);
    if (!existingDriver) {
      throw new CustomError('USER_NOT_FOUND', 'El repartidor no existe');
    }
    if (existingDriver.role !== ROLES.DRIVER) {
      throw new CustomError('INVALID_ROLE', 'El usuario no tiene rol de repartidor');
    }

    if (existingOrder.status !== ORDER_STATUS.CREATED) {
      throw new CustomError('ORDER_ALREADY_PROCESSED');
    }

    const newDelivery = await deliveryRepository.create({
      order,
      driver,
      priority: priority || PRIORITY.NORMAL,
      status: DELIVERY_STATUS.ASSIGNED,
      assignedAt: new Date()
    });

    await orderRepository.updateById(order, {
      status: ORDER_STATUS.ASSIGNED,
      delivery: newDelivery._id
    });

    logger.info(`Entrega ${newDelivery._id} creada para el pedido ${order}`);

    return newDelivery;
  }

  async updateDeliveryStatus(id, status) {
    if (!status) {
      throw new CustomError('MISSING_FIELDS', 'El estado es obligatorio');
    }
    if (!Object.values(DELIVERY_STATUS).includes(status)) {
      throw new CustomError('INVALID_STATUS');
    }

    const delivery = await deliveryRepository.findById(id);
    if (!delivery) {
      throw new CustomError('DELIVERY_NOT_FOUND');
    }
    if (delivery.status === DELIVERY_STATUS.DELIVERED) {
      throw new CustomError('DELIVERY_ALREADY_COMPLETED');
    }

    const updates = { status };
    if (status === DELIVERY_STATUS.DELIVERED) {
      updates.deliveredAt = new Date();
    }

    const updatedDelivery = await deliveryRepository.updateById(id, updates);

    if (status === DELIVERY_STATUS.DELIVERED) {
      await orderRepository.updateById(delivery.order, { status: ORDER_STATUS.DELIVERED });
    }

    logger.info(`Entrega ${updatedDelivery._id} actualizada a: ${status}`);
    return updatedDelivery;
  }

  async deleteDelivery(id) {
    const deletedDelivery = await deliveryRepository.deleteById(id);
    if (!deletedDelivery) {
      throw new CustomError('DELIVERY_NOT_FOUND');
    }
    return deletedDelivery;
  }
}

export default new DeliveryService();
