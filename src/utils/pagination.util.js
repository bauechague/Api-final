import { CustomError } from '../errors/custom-error.js';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function parseIntegerParam(value, fallback, max) {
  if (value === undefined) {
    return fallback;
  }
  if (!/^\d+$/.test(value)) {
    throw new CustomError('INVALID_PAGINATION');
  }
  const number = Number(value);
  if (number < 1 || (max && number > max)) {
    throw new CustomError('INVALID_PAGINATION');
  }
  return number;
}

export function parsePagination(query) {
  const page = parseIntegerParam(query.page, DEFAULT_PAGE);
  const limit = parseIntegerParam(query.limit, DEFAULT_LIMIT, MAX_LIMIT);
  return { limit, skip: (page - 1) * limit };
}
