import { CustomError } from '../errors/custom-error.js';

export function notFoundHandler(req, res, next) {
  next(new CustomError('ROUTE_NOT_FOUND', `Ruta no encontrada: ${req.method} ${req.originalUrl}`));
}

export default notFoundHandler;
