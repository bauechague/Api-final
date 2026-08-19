import userRepository from '../repositories/user.repository.js';
import { createHttpError } from '../utils/http-error.js';
import { ROLES } from '../constants/index.js';

class UserService {
  async getAllUsers() {
    return userRepository.findAll();
  }

  async getUserById(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw createHttpError(404, 'Usuario no encontrado');
    }
    return user;
  }

  async createUser({ firstName, lastName, email, password, role }) {
    if (!firstName || !lastName || !email || !password) {
      throw createHttpError(400, 'Faltan datos obligatorios');
    }

    if (role === ROLES.ADMIN) {
      throw createHttpError(403, 'No puedes crear admin');
    }

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw createHttpError(409, 'El email ya esta registrado');
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
      throw createHttpError(404, 'Usuario no encontrado');
    }
    return deletedUser;
  }
}

export default new UserService();
