import deliveryService from '../services/delivery.service.js';
import { parsePagination } from '../utils/pagination.util.js';

class DeliveryController {
  async getAll(req, res, next) {
    try {
      const deliveries = await deliveryService.getAllDeliveries(parsePagination(req.query));
      res.json(deliveries);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const delivery = await deliveryService.getDeliveryById(req.params.did);
      res.json(delivery);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const delivery = await deliveryService.createDelivery(req.body);
      res.status(201).json(delivery);
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const delivery = await deliveryService.updateDeliveryStatus(req.params.did, req.body.status);
      res.json(delivery);
    } catch (error) {
      next(error);
    }
  }

  async remove(req, res, next) {
    try {
      await deliveryService.deleteDelivery(req.params.did);
      res.json({ message: 'Entrega eliminada' });
    } catch (error) {
      next(error);
    }
  }

  async uploadReceipt(req, res, next) {
    try {
      const delivery = await deliveryService.attachReceipt(req.params.did, req.file);
      res.status(201).json(delivery);
    } catch (error) {
      next(error);
    }
  }
}

export default new DeliveryController();
