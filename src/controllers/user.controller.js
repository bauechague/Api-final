import userService from '../services/user.service.js';

class UserController {
  async getAll(req, res, next) {
    try {
      const users = await userService.getAllUsers();
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
}

export default new UserController();
