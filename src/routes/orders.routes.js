import { Router } from 'express';
import Order from '../models/order.model.js';
import User from '../models/user.model.js';

const router = Router();

// GET /api/orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (error) {
    res.status(500).send('Error del servidor');
  }
});

// GET /api/orders/:oid
router.get('/:oid', async (req, res) => {
  try {
    const order = await Order.findById(req.params.oid);
    if (!order) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).send('Error del servidor');
  }
});

// POST /api/orders
router.post('/', async (req, res) => {
  try {
    const { customer, items, deliveryAddress, priority } = req.body;

    if (!customer) {
      return res.status(400).send('Falta el cliente');
    }
    if (!items || items.length === 0) {
      return res.status(400).send('Falta los items del pedido');
    }
    if (!deliveryAddress) {
      return res.status(400).send('Falta la direccion');
    }

    const total = items.reduce((acc, item) => {
      return acc + item.price * item.quantity;
    }, 0);

    const user = await User.findById(customer);
    if (!user) {
      return res.status(404).json({ error: 'El usuario no existe' });
    }

    if (user.role === 'driver') {
      return res.status(403).send('Los repartidores no pueden crear pedidos');
    }

    const newOrder = await Order.create({
      customer,
      items,
      deliveryAddress,
      total,
      priority: priority || 'normal',
      status: 'created'
    });

    console.log(`[EMAIL SIMULADO] Enviando confirmacion al usuario ${customer}...`);
    console.log(`[EMAIL SIMULADO] Tu pedido ${newOrder._id} fue creado. Total: $${total}`);

    const shippingCost = newOrder.items.reduce((acc, item) => {
      return acc + (item.quantity * 10);
    }, 0);

    res.status(201).json({
      order: newOrder,
      shippingCost,
      message: 'Pedido creado y email enviado'
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error del servidor');
  }
});

// PATCH /api/orders/:oid/status
router.patch('/:oid/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).send('El estado es obligatorio');
    }

    const order = await Order.findById(req.params.oid);

    if (!order) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    if (order.status === 'delivered') {
      return res.status(409).json({
        error: 'El pedido ya fue entregado',
        currentStatus: order.status
      });
    }

    if (order.status === 'delivered' && status === 'created') {
      return res.status(400).send('No se puede reiniciar un pedido entregado');
    }

    order.status = status;
    await order.save();

    console.log(`Pedido ${order._id} actualizado a estado: ${status}`);

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error del servidor');
  }
});

// DELETE /api/orders/:oid
router.delete('/:oid', async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.oid);
    if (!order) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    res.json({ message: 'Pedido eliminado' });
  } catch (error) {
    res.status(500).send('Error del servidor');
  }
});

export default router;
