import User from '../models/user.model.js';
import Order from '../models/order.model.js';
import Delivery from '../models/delivery.model.js';

class MockRepository {
  async insertUsers(users) {
    return User.insertMany(users);
  }

  async insertOrders(orders) {
    return Order.insertMany(orders);
  }

  async insertDeliveries(deliveries) {
    return Delivery.insertMany(deliveries);
  }

  async findUsersByRole(role, limit) {
    return User.find({ role }).limit(limit);
  }

  async findUsersExcludingRole(role, limit) {
    return User.find({ role: { $ne: role } }).limit(limit);
  }

  async findOrdersByStatus(status, limit) {
    return Order.find({ status }).limit(limit);
  }

  async linkDeliveryToOrder(orderId, deliveryId, status) {
    return Order.findByIdAndUpdate(orderId, { status, delivery: deliveryId });
  }
}

export default new MockRepository();
