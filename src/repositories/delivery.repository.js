import Delivery from '../models/delivery.model.js';

class DeliveryRepository {
  async findAll() {
    return Delivery.find();
  }

  async findById(id) {
    return Delivery.findById(id);
  }

  async create(deliveryData) {
    return Delivery.create(deliveryData);
  }

  async updateById(id, updates) {
    return Delivery.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  }

  async deleteById(id) {
    return Delivery.findByIdAndDelete(id);
  }
}

export default new DeliveryRepository();
