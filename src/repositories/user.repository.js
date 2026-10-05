import User from '../models/user.model.js';

// Campos que nunca deben salir de la capa de datos (ej. password)
const PUBLIC_FIELDS = '-password';

class UserRepository {
  async findAll({ skip, limit }) {
    return User.find().select(PUBLIC_FIELDS).sort({ createdAt: -1 }).skip(skip).limit(limit);
  }

  async findById(id) {
    return User.findById(id).select(PUBLIC_FIELDS);
  }

  async findByEmail(email) {
    return User.findOne({ email });
  }

  async create(userData) {
    const user = await User.create(userData);
    const { password, ...publicUser } = user.toObject();
    return publicUser;
  }

  async deleteById(id) {
    return User.findByIdAndDelete(id);
  }

  async addDocument(id, metadata) {
    return User.findByIdAndUpdate(
      id,
      { $push: { documents: metadata } },
      { new: true, runValidators: true }
    ).select(PUBLIC_FIELDS);
  }
}

export default new UserRepository();
