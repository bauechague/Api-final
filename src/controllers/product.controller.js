import productService from '../services/product.service.js';

class ProductController {
  async getAll(req, res) {
    try {
      const products = await productService.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message || 'Error del servidor' });
    }
  }

  async getById(req, res) {
    try {
      const product = await productService.getProductById(req.params.pid);
      res.json(product);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message || 'Error del servidor' });
    }
  }

  async create(req, res) {
    try {
      const product = await productService.createProduct(req.body);
      res.status(201).json(product);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message || 'Error del servidor' });
    }
  }

  async update(req, res) {
    try {
      const product = await productService.updateProduct(req.params.pid, req.body);
      res.json(product);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message || 'Error del servidor' });
    }
  }

  async remove(req, res) {
    try {
      await productService.deleteProduct(req.params.pid);
      res.json({ message: 'Producto eliminado' });
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message || 'Error del servidor' });
    }
  }
}

export default new ProductController();
