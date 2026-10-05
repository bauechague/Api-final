import express from 'express';
import cors from 'cors';

import config from './config/env.config.js';
import usersRouter from './routes/users.routes.js';
import ordersRouter from './routes/orders.routes.js';
import deliveriesRouter from './routes/deliveries.routes.js';
import productsRouter from './routes/products.routes.js';
import mocksRouter from './routes/mocks.routes.js';
import loggerRouter from './routes/logger.routes.js';
import docsRouter from './routes/docs.routes.js';
import healthRouter from './routes/health.routes.js';
import notFoundHandler from './middlewares/not-found.middleware.js';
import errorHandler from './middlewares/error-handler.middleware.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas de la API
app.use('/api/users', usersRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/deliveries', deliveriesRouter);
app.use('/api/products', productsRouter);
app.use('/api/docs', docsRouter);
app.use('/api/health', healthRouter);

// Herramientas internas: no se montan en produccion
if (config.nodeEnv !== 'production') {
  app.use('/api/mocks', mocksRouter);
  app.use('/api/logger', loggerRouter);
}

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
