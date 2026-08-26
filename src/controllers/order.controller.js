import orderService from '../services/order.service.js';

class OrderController {
  async getAll(req, res, next) {
    try {
      const orders = await orderService.getAllOrders();
      res.json(orders);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const order = await orderService.getOrderById(req.params.oid);
      res.json(order);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const { order, shippingCost } = await orderService.createOrder(req.body);
      res.status(201).json({ order, shippingCost, message: 'Pedido creado y email enviado' });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const order = await orderService.updateOrderStatus(req.params.oid, req.body.status);
      res.json(order);
    } catch (error) {
      next(error);
    }
  }

  async remove(req, res, next) {
    try {
      await orderService.deleteOrder(req.params.oid);
      res.json({ message: 'Pedido eliminado' });
    } catch (error) {
      next(error);
    }
  }
}

export default new OrderController();
