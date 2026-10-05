import userService from '../services/user.service.js';
import { parsePagination } from '../utils/pagination.util.js';

class UserController {
  async getAll(req, res, next) {
    try {
      const users = await userService.getAllUsers(parsePagination(req.query));
      res.json(users);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const user = await userService.getUserById(req.params.uid);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const user = await userService.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }

  async remove(req, res, next) {
    try {
      await userService.deleteUser(req.params.uid);
      res.json({ message: 'Usuario eliminado' });
    } catch (error) {
      next(error);
    }
  }

  async uploadDocument(req, res, next) {
    try {
      const user = await userService.addDocument(req.params.uid, req.file, req.body.documentType);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
