import { mockFunctions } from 'jest-mock-functions';
const actualModule = require.requireActual('@openapi-platform/logger');
export const {
  openapiLogger,
  consoleTransport,
  fileTransport,
  overrideConsoleLogger,
  overrideUtilInspectStyle,
} = mockFunctions(actualModule);
openapiLogger.mockImplementation(() => {
  const actualLogger = actualModule.openapiLogger();
  const mockedLogger = mockFunctions({
    ...actualLogger,
  });
  mockedLogger.exceptions.handle = jest.fn();
  mockedLogger.add = jest.fn().mockImplementation(() => mockedLogger);
  return mockedLogger;
});
