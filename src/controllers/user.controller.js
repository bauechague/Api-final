import userService from '../services/user.service.js';

class UserController {
  async getAll(req, res) {
    try {
      const users = await userService.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message || 'Error del servidor' });
    }
  }

  async getById(req, res) {
    try {
      const user = await userService.getUserById(req.params.uid);
      res.json(user);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message || 'Error del servidor' });
    }
  }

  async create(req, res) {
    try {
      const user = await userService.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message || 'Error del servidor' });
    }
  }

  async remove(req, res) {
    try {
      await userService.deleteUser(req.params.uid);
      res.json({ message: 'Usuario eliminado' });
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message || 'Error del servidor' });
    }
  }
}

export default new UserController();
