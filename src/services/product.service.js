import productRepository from '../repositories/product.repository.js';
import { CustomError } from '../errors/custom-error.js';
import { PRODUCT_STATUS } from '../constants/index.js';

function resolveStatusFromStock(stock) {
  return stock > 0 ? PRODUCT_STATUS.AVAILABLE : PRODUCT_STATUS.OUT_OF_STOCK;
}

class ProductService {
  async getAllProducts(pagination) {
    return productRepository.findAll(pagination);
  }

  async getProductById(id) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new CustomError('PRODUCT_NOT_FOUND');
    }
    return product;
  }

  async createProduct({ name, description, price, stock, category, status }) {
    if (!name || price === undefined || stock === undefined) {
      throw new CustomError('MISSING_FIELDS', 'Faltan datos obligatorios (name, price, stock)');
    }
    if (price < 0) {
      throw new CustomError('INVALID_PRICE');
    }
    if (stock < 0) {
      throw new CustomError('INVALID_STOCK');
    }

    return productRepository.create({
      name,
      description,
      price,
      stock,
      category,
      status: stock > 0 ? (status || PRODUCT_STATUS.AVAILABLE) : PRODUCT_STATUS.OUT_OF_STOCK
    });
  }

  async updateProduct(id, { name, description, price, stock, category, status }) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new CustomError('PRODUCT_NOT_FOUND');
    }

    if (price !== undefined && price < 0) {
      throw new CustomError('INVALID_PRICE');
    }
    if (stock !== undefined && stock < 0) {
      throw new CustomError('INVALID_STOCK');
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (price !== undefined) updates.price = price;
    if (category !== undefined) updates.category = category;

    if (stock !== undefined) {
      updates.stock = stock;
      updates.status = resolveStatusFromStock(stock);
    } else if (status !== undefined && product.stock > 0) {
      updates.status = status;
    }

    return productRepository.updateById(id, updates);
  }

  async deleteProduct(id) {
    const deletedProduct = await productRepository.deleteById(id);
    if (!deletedProduct) {
      throw new CustomError('PRODUCT_NOT_FOUND');
    }
    return deletedProduct;
  }
}

export default new ProductService();
