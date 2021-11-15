const winston = require("winston");
const config = require("config");
require("winston-mongodb");
require("express-async-errors");

module.exports = function () {
  winston.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
  winston.add(
    new winston.transports.File({
      level: "info",
      filename: "logfile.log",
      handleException: true,
    })
  );

  winston.add(
    new winston.transports.File({
      filename: "uncaughtExceptions.log",
      handleExceptions: true,
      format: winston.format.simple(this),
    })
  );

  winston.add(
    new winston.transports.MongoDB({
      db: config.get("db"),
      level: "info",
    })
  );
};
