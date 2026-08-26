import mockService from '../services/mock.service.js';

class MockController {
  async getUsers(req, res, next) {
    try {
      const users = mockService.getMockUsers(req.query.qty, req.query.role);
      res.json(users);
    } catch (error) {
      next(error);
    }
  }

  async getOrders(req, res, next) {
    try {
      const orders = mockService.getMockOrders(req.query.qty);
      res.json(orders);
    } catch (error) {
      next(error);
    }
  }

  async getDeliveries(req, res, next) {
    try {
      const deliveries = mockService.getMockDeliveries(req.query.qty);
      res.json(deliveries);
    } catch (error) {
      next(error);
    }
  }

  async seed(req, res, next) {
    try {
      const type = req.query.type || 'users';
      const result = await mockService.seed(type, req.query.qty);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default new MockController();
