import Delivery from '../models/delivery.model.js';

class DeliveryRepository {
  async findAll({ skip, limit }) {
    return Delivery.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
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

  async attachReceipt(id, metadata) {
    return Delivery.findByIdAndUpdate(
      id,
      { receipt: metadata },
      { new: true, runValidators: true }
    );
  }
}

export default new DeliveryRepository();
