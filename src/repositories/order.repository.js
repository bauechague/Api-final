import Order from '../models/order.model.js';

class OrderRepository {
  async findAll() {
    return Order.find();
  }

  async findById(id) {
    return Order.findById(id);
  }

  async create(orderData) {
    return Order.create(orderData);
  }

  async updateById(id, updates) {
    return Order.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  }

  async deleteById(id) {
    return Order.findByIdAndDelete(id);
  }
}

export default new OrderRepository();
