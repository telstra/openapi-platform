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
  const mockedLogger = mockFunctions(actualModule.openapiLogger(), {
    recursive: { classInstances: true },
  });
  mockedLogger.add = jest.fn().mockImplementation(() => mockedLogger);
  return mockedLogger;
});
