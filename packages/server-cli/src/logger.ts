import { openapiLogger, consoleTransport, overrideConsoleLogger, overrideUtilInspectStyle } from '@openapi-platform/logger';
const logger = openapiLogger().add(consoleTransport({ level: 'verbose' }));
overrideConsoleLogger(logger);
overrideUtilInspectStyle();
logger.exceptions.handle(consoleTransport());
export { logger };
