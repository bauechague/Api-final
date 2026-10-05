import Product from '../models/product.model.js';

class ProductRepository {
  async findAll({ skip, limit }) {
    return Product.find().select('-__v').sort({ createdAt: -1 }).skip(skip).limit(limit);
  }

  async findById(id) {
    return Product.findById(id).select('-__v');
  }

  async create(productData) {
    return Product.create(productData);
  }

  async updateById(id, updates) {
    return Product.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).select('-__v');
  }

  async deleteById(id) {
    return Product.findByIdAndDelete(id);
  }
}

export default new ProductRepository();
