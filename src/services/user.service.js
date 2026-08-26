import userRepository from '../repositories/user.repository.js';
import { CustomError } from '../errors/custom-error.js';
import { ROLES } from '../constants/index.js';

class UserService {
  async getAllUsers() {
    return userRepository.findAll();
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
}

export default new UserService();
