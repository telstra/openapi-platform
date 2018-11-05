import { mockFunctions } from 'jest-mock-functions';
const actualModule = require.requireActual('@openapi-platform/logger');
const mockedModule = mockFunctions(actualModule);
mockedModule.openapiLogger.mockImplementation(() => {
  const mockedLogger = mockFunctions(actualModule.openapiLogger(), {
    recursive: { classInstances: true },
  });
  mockedLogger.add = jest.fn().mockImplementation(() => mockedLogger);
  return mockedLogger;
});
export const {
  openapiLogger,
  consoleTransport,
  fileTransport,
  overrideConsoleLogger,
  overrideUtilInspectStyle,
} = mockedModule;
