import { mockFunctions } from 'jest-mock-functions';
const actualModule = require.requireActual('@openapi-platform/logger');
export const {
  openapiLogger,
  overrideConsoleLogger,
  overrideUtilInspectStyle,
} = mockFunctions(actualModule);
openapiLogger.mockImplementation((...options) => {
  return mockFunctions(actualModule.openapiLogger(...options), { recursive: true });
});
