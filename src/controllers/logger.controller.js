import logger from '../config/logger.config.js';

class LoggerController {
  test(req, res) {
    logger.debug('Log de prueba: debug');
    logger.http('Log de prueba: http');
    logger.info('Log de prueba: info');
    logger.warning('Log de prueba: warning');
    logger.error('Log de prueba: error');
    logger.fatal('Log de prueba: fatal');

    res.json({ message: 'Se generaron logs de todos los niveles' });
  }
}

export default new LoggerController();
