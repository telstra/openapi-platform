import { openapiLogger, consoleTransport } from '@openapi-platform/logger';
const logger = openapiLogger().add(consoleTransport({ level: 'verbose' }));
logger.exceptions.handle(consoleTransport());
export { logger };
