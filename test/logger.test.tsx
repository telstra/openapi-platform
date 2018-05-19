import { logger, overrideConsoleLogger } from 'backend/logger';
const mockLogger: any = { levels: logger.levels };
Object.keys(logger.levels).forEach(level => {
  mockLogger[level] = jest.fn();
});

/**
 * Checks which logging methods in the custom logger were actually called
 */
function testLoggerCallCounts(callCounts) {
  Object.keys(mockLogger.levels).forEach(level => {
    expect(mockLogger[level].mock.calls.length).toBe(
      callCounts[level] ? callCounts[level] : 0,
    );
  });
}

/**
 * Will test if logging something through console.xxx will, in turn,
 * call the custom logger logging methods if you use overrideConsoleLogger
 */
function testConsoleInput(...input) {
  const stringifiedInput = input.map(i => JSON.stringify(i)).join();
  describe(`input = [${stringifiedInput}]`, () => {
    it(`console.log`, () => {
      overrideConsoleLogger(mockLogger);
      // tslint:disable-next-line:no-console
      console.log(input);
      testLoggerCallCounts({ verbose: 1 });
    });
    const loggingMethods = ['error', 'debug', 'info'];
    loggingMethods.forEach(loggingMethodName => {
      it(`console.${loggingMethodName}`, () => {
        overrideConsoleLogger(mockLogger);
        console[loggingMethodName](input);
        testLoggerCallCounts({ [loggingMethodName]: 1 });
      });
    });
  });
}
// TODO: Might be nice if we test the actual stuff that ends up being logged too
describe('console logs to custom logger', () => {
  testConsoleInput(undefined);
  testConsoleInput('');
  testConsoleInput('a');
  testConsoleInput('Hello');
  testConsoleInput(['test']);
  testConsoleInput('this', 'is', 'a', 'test');
  testConsoleInput({ also: 'a', test: ':D' });
  testConsoleInput(0);
  testConsoleInput(() => {});
  testConsoleInput(/reaewr/g);
});
