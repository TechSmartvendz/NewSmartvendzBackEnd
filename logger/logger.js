const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: './logger/error.log', level: 'error' }),
    new winston.transports.File({ filename: './logger/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

module.exports = logger;
