import multer from 'multer';
import { CustomError } from '../errors/custom-error.js';
import { ERROR_CODES } from '../errors/error-codes.js';
import logger from '../config/logger.config.js';

export function errorHandler(error, req, res, next) {
  if (error instanceof CustomError) {
    logger.warning(`${error.code}: ${error.message}`);
    return res.status(error.statusCode).json({
      error: { code: error.code, message: error.message }
    });
  }

  if (error instanceof multer.MulterError) {
    const code = error.code === 'LIMIT_FILE_SIZE' ? 'FILE_TOO_LARGE' : 'UNEXPECTED_FILE_FIELD';
    logger.warning(`${code}: ${error.message}`);
    return res.status(ERROR_CODES[code].statusCode).json({
      error: { code, message: ERROR_CODES[code].message }
    });
  }

  if (error.name === 'ValidationError') {
    logger.warning(`VALIDATION_ERROR: ${error.message}`);
    return res.status(ERROR_CODES.VALIDATION_ERROR.statusCode).json({
      error: { code: 'VALIDATION_ERROR', message: error.message }
    });
  }

  if (error.name === 'CastError') {
    logger.warning('VALIDATION_ERROR: el id no tiene un formato valido');
    return res.status(ERROR_CODES.VALIDATION_ERROR.statusCode).json({
      error: { code: 'VALIDATION_ERROR', message: 'El id no tiene un formato valido' }
    });
  }

  logger.error(error.stack || error.message);
  res.status(ERROR_CODES.INTERNAL_SERVER_ERROR.statusCode).json({
    error: { code: 'INTERNAL_SERVER_ERROR', message: ERROR_CODES.INTERNAL_SERVER_ERROR.message }
  });
}

export default errorHandler;
