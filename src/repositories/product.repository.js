import Product from '../models/product.model.js';

class ProductRepository {
  async findAll(filter = {}) {
    return Product.find(filter).select('-__v').sort({ createdAt: -1 });
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
