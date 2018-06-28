import colors from 'colors';
import moment from 'moment';
import util from 'util';
import { createLogger, format, transports } from 'winston';

const logLevel: string = process.env.LOG_LEVEL || 'debug';

// Adds a timestamp to the logger information
const swaggerPlatformTimestamp = format(info => {
  info.timestamp = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
  return info;
});

// Aligns all the information before the message section of the log
const swaggerPlatformAlign = format(info => {
  const messageIndentation = 9;
  info.levelPadding = ' '.repeat(messageIndentation - info.level.length);
  return info;
});

// Colorizes/formats javascript objects and timestamps
const swaggerPlatformFormatter = format((info, options) => {
  info.timestamp = options.colors ? colors.gray(info.timestamp) : info.timestamp;
  if (
    !(info.message instanceof Error) &&
    (info.message instanceof Object || Array.isArray(info.message))
  ) {
    info.message = util.inspect(info.message, { colors: options.colors });
  }
  return info;
});

// Specifies the order in which all the information is printed out
const swaggerPlatformPrinter = format.printf((info, options) => {
  return `${info.timestamp} ${info.level}${info.levelPadding ? info.levelPadding : ' '}${
    info.message
  }`;
});

const logger = createLogger({
  format: format.combine(
    format.splat(),
    swaggerPlatformTimestamp(),
    swaggerPlatformAlign(),
  ),
  transports: [
    new transports.Console({
      level: logLevel,
      format: format.combine(
        format.colorize(),
        swaggerPlatformFormatter({ colors: true }),
        swaggerPlatformPrinter,
      ),
    }),
    // Note that we don't want color codes in our file logs (looks incredibly confusing and ugly)
    new transports.File({
      filename: 'swagger-platform.error.log',
      level: 'error',
      format: swaggerPlatformPrinter,
    }),
    new transports.File({
      filename: 'swagger-platform.log',
      level: logLevel,
      format: swaggerPlatformPrinter,
    }),
  ],
});

// This is for use with Morgan
logger.stream = {
  write: (message, encoding) => logger.info(message),
};
export { logger };

/**
 * Replaces the console.log type methods with our own logger methods.
 * It's not recommended to use console methods to print. Use the logger variable itself to log messages.
 * However, this method is useful when external packages have console.log(...) calls inside of them.
 */
export function overrideConsoleLogger(aLogger) {
  // Since we're using splat we have to create placeholders for the arguments to go into
  // TODO: Note that string interpolation with console.log won't work (E.g. console.log("%s", "test") will print "%stest")
  const createPlaceholders = args => new Array(args.length).fill('%s').join(' ');
  Object.keys(aLogger.levels).forEach(level => {
    console[level] = (...args) => aLogger[level](createPlaceholders(args), ...args);
  });
  console.log = (...args) => aLogger.verbose(createPlaceholders(args), ...args);
}

/**
 * Restyles the util.inspect() method output.
 */
export function overrideUtilInspectStyle() {
  // We want field names to be yellow when logging JavaScript objects
  util.inspect.styles.name = 'yellow';
}
