import dotenv from 'dotenv';

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: envFile });

const REQUIRED_ENV_VARS = ['PORT', 'MONGODB_URI', 'NODE_ENV', 'UPLOAD_DIR'];
const VALID_NODE_ENVS = ['development', 'test', 'production'];

function validateEnv() {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Faltan variables de entorno obligatorias: ${missing.join(', ')}. ` +
      'Revisa tu archivo .env (podes usar .env.example como referencia).'
    );
  }

  if (!VALID_NODE_ENVS.includes(process.env.NODE_ENV)) {
    throw new Error(
      `NODE_ENV invalido: "${process.env.NODE_ENV}". Valores permitidos: ${VALID_NODE_ENVS.join(', ')}.`
    );
  }
}

validateEnv();

const config = Object.freeze({
  port: process.env.PORT,
  mongoUri: process.env.MONGODB_URI,
  nodeEnv: process.env.NODE_ENV,
  uploadDir: process.env.UPLOAD_DIR,
  logLevel: process.env.LOG_LEVEL || null
});

export default config;
