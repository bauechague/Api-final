import productService from '../services/product.service.js';

class ProductController {
  async getAll(req, res, next) {
    try {
      const products = await productService.getAllProducts();
      res.json(products);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const product = await productService.getProductById(req.params.pid);
      res.json(product);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const product = await productService.createProduct(req.body);
      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const product = await productService.updateProduct(req.params.pid, req.body);
      res.json(product);
    } catch (error) {
      next(error);
    }
  }

  async remove(req, res, next) {
    try {
      await productService.deleteProduct(req.params.pid);
      res.json({ message: 'Producto eliminado' });
    } catch (error) {
      next(error);
    }
  }
}

export default new ProductController();
