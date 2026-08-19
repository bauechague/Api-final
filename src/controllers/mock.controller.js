import mockService from '../services/mock.service.js';
import { parseQty } from '../utils/random.util.js';

class MockController {
  async getUsers(req, res) {
    try {
      const qty = parseQty(req.query.qty);
      const users = mockService.getMockUsers(qty, req.query.role);
      res.json(users);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message || 'Error del servidor' });
    }
  }

  async getOrders(req, res) {
    try {
      const qty = parseQty(req.query.qty);
      const orders = mockService.getMockOrders(qty);
      res.json(orders);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message || 'Error del servidor' });
    }
  }

  async getDeliveries(req, res) {
    try {
      const qty = parseQty(req.query.qty);
      const deliveries = mockService.getMockDeliveries(qty);
      res.json(deliveries);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message || 'Error del servidor' });
    }
  }

  async seed(req, res) {
    try {
      const qty = parseQty(req.query.qty);
      const type = req.query.type || 'users';
      const result = await mockService.seed(type, qty);
      res.status(201).json(result);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message || 'Error del servidor' });
    }
  }
}

export default new MockController();
