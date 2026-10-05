import fs from 'fs';
import userRepository from '../repositories/user.repository.js';
import { CustomError } from '../errors/custom-error.js';
import logger from '../config/logger.config.js';
import { buildFileMetadata } from '../utils/file-metadata.util.js';
import { ROLES, DOCUMENT_TYPES } from '../constants/index.js';

class UserService {
  async getAllUsers(pagination) {
    return userRepository.findAll(pagination);
  }

  async getUserById(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new CustomError('USER_NOT_FOUND');
    }
    return user;
  }

  async createUser({ firstName, lastName, email, password, role }) {
    if (!firstName || !lastName || !email || !password) {
      throw new CustomError('MISSING_FIELDS');
    }

    if (role === ROLES.ADMIN) {
      throw new CustomError('FORBIDDEN_ROLE', 'No puedes crear admin');
    }

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new CustomError('EMAIL_ALREADY_REGISTERED');
    }

    return userRepository.create({
      firstName,
      lastName,
      email,
      password,
      role: role || ROLES.CUSTOMER
    });
  }

  async deleteUser(id) {
    const deletedUser = await userRepository.deleteById(id);
    if (!deletedUser) {
      throw new CustomError('USER_NOT_FOUND');
    }
    return deletedUser;
  }

  async addDocument(id, file, documentType) {
    try {
      const user = await userRepository.findById(id);
      if (!user) {
        throw new CustomError('USER_NOT_FOUND');
      }
      if (!file) {
        throw new CustomError('FILE_REQUIRED');
      }
      if (!documentType || !Object.values(DOCUMENT_TYPES).includes(documentType)) {
        throw new CustomError('INVALID_DOCUMENT_TYPE');
      }

      const metadata = buildFileMetadata(file, documentType);
      const updatedUser = await userRepository.addDocument(id, metadata);

      logger.info(`Documento ${documentType} cargado para el usuario ${id}`);
      return updatedUser;
    } catch (error) {
      if (file) {
        fs.unlink(file.path, () => {});
      }
      throw error;
    }
  }
}

export default new UserService();
