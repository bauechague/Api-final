import mongoose from 'mongoose';
import config from '../src/config/env.config.js';

before(async () => {
  if (config.nodeEnv !== 'test') {
    throw new Error('Los tests tienen que correr con NODE_ENV=test (usa npm test, no mocha directo)');
  }
  await mongoose.connect(config.mongoUri);
});

after(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});
