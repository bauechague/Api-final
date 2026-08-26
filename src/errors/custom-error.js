import { ERROR_CODES } from './error-codes.js';

export class CustomError extends Error {
  constructor(code, message) {
    const definition = ERROR_CODES[code] || ERROR_CODES.INTERNAL_SERVER_ERROR;
    super(message || definition.message);
    this.code = ERROR_CODES[code] ? code : 'INTERNAL_SERVER_ERROR';
    this.statusCode = definition.statusCode;
  }
}
