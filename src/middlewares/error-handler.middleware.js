import { CustomError } from '../errors/custom-error.js';
import { ERROR_CODES } from '../errors/error-codes.js';

export function errorHandler(error, req, res, next) {
  if (error instanceof CustomError) {
    return res.status(error.statusCode).json({
      error: { code: error.code, message: error.message }
    });
  }

  if (error.name === 'ValidationError') {
    return res.status(ERROR_CODES.VALIDATION_ERROR.statusCode).json({
      error: { code: 'VALIDATION_ERROR', message: error.message }
    });
  }

  if (error.name === 'CastError') {
    return res.status(ERROR_CODES.VALIDATION_ERROR.statusCode).json({
      error: { code: 'VALIDATION_ERROR', message: 'El id no tiene un formato valido' }
    });
  }

  console.error(error);
  res.status(ERROR_CODES.INTERNAL_SERVER_ERROR.statusCode).json({
    error: { code: 'INTERNAL_SERVER_ERROR', message: ERROR_CODES.INTERNAL_SERVER_ERROR.message }
  });
}

export default errorHandler;
