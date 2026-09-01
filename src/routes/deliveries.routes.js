import { Router } from 'express';
import deliveryController from '../controllers/delivery.controller.js';
import { uploadDeliveryReceipt } from '../config/multer.config.js';

const router = Router();

router.get('/', deliveryController.getAll);
router.get('/:did', deliveryController.getById);
router.post('/', deliveryController.create);
router.patch('/:did/status', deliveryController.updateStatus);
router.delete('/:did', deliveryController.remove);
router.post('/:did/receipt', uploadDeliveryReceipt, deliveryController.uploadReceipt);

export default router;
