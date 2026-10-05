import multer from 'multer';
import path from 'path';
import fs from 'fs';
import config from './env.config.js';
import { CustomError } from '../errors/custom-error.js';
import { randomSuffix } from '../utils/random.util.js';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

function createUploader(subfolder) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const destination = path.join(config.uploadDir, subfolder);
      fs.mkdir(destination, { recursive: true }, (error) => cb(error, destination));
    },
    filename: (req, file, cb) => {
      const generatedName = `${Date.now()}-${randomSuffix(8)}${path.extname(file.originalname)}`;
      cb(null, generatedName);
    }
  });

  const fileFilter = (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new CustomError('INVALID_FILE_TYPE', `Tipo de archivo no permitido: ${file.mimetype}`));
    }
    cb(null, true);
  };

  return multer({ storage, fileFilter, limits: { fileSize: MAX_FILE_SIZE } });
}

export const uploadUserDocument = createUploader('users').single('file');
export const uploadDeliveryReceipt = createUploader('deliveries').single('file');
