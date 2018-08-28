import { mockFunctions } from 'jest-mock-functions';
import MockDate from 'mockdate';
import { openapiLogger, overrideConsoleLogger , consoleTransport} from '../../src';

const mockLogger: any = mockFunctions(openapiLogger(), { recursive: true });
const loggingMethods = ['error', 'debug', 'info'];

/**
 * Checks which logging methods in the custom logger were actually called
 */
function testLoggerCallCounts(callCounts) {
  Object.keys(mockLogger.levels).forEach(level => {
    const callCount = callCounts[level] ? callCounts[level] : 0;
    expect(mockLogger[level].mock.calls.length).toBe(callCount);
  });
}

/**
 * Will test if logging something through console.xxx will, in turn,
 * call the custom logger logging methods if you use overrideConsoleLogger
 */
function testConsoleInput(...input) {
  const stringifiedInput = input.map(i => JSON.stringify(i)).join();
  describe(`input = [${stringifiedInput}]`, () => {
    it(`logging to console.log`, () => {
      overrideConsoleLogger(mockLogger);
      // tslint:disable-next-line:no-console
      console.log(...input);
      testLoggerCallCounts({ verbose: 1 });
    });
    loggingMethods.forEach(loggingMethodName => {
      it(`logging to console.${loggingMethodName}}`, () => {
        overrideConsoleLogger(mockLogger);
        console[loggingMethodName](...input);
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
  testConsoleInput(new Error('message goes here'));
});

// Set timezone to const value then adjust for timezone
MockDate.set('2018-05-03T12:34:56z');
const tempdate = new Date();
const adjustedTime = tempdate.getTime() + tempdate.getTimezoneOffset() * 60 * 1000;
MockDate.set(adjustedTime);

// replace stdout.write so we can capture output
let lastMessage = '';
// const oldWrite = process.stdout.write; //use this if needing to replace stdout
process.stdout.write = (function(write) {
  return function(lastString, encoding, fd) {
    write.apply(process.stdout, arguments);
    lastMessage = lastString.strip.trim();
  };
})(process.stdout.write);

const loggerNames = ['debug', 'info', 'warn'];
const loggers = [
  openapiLogger().add(consoleTransport({ level: 'debug' })).debug,
  openapiLogger().add(consoleTransport({ level: 'info' })).info,
  openapiLogger().add(consoleTransport({ level: 'warn' })).warn,
]

for (let i = 0; i < loggerNames.length; i++) {
  const name = loggerNames[i];
  const testLogger = loggers[i];

  function formatExpected(expectedString) {
    const prefix: string = '2018-05-03 12:34:56 ';
    const padding: string = ' '.repeat(9 - name.length);
    const output: string = (prefix + name + padding + expectedString).strip.trim();
    return output;
  }

  describe(name + ' logger tests', () => {
    it('Simple String', () => {
      testLogger('a message :)');
      expect(lastMessage).toBe(formatExpected('a message :)'));
    });

    it('Undefined', () => {
      testLogger(undefined);
      expect(lastMessage).toBe(formatExpected('undefined'));
    });

    it('Empty String', () => {
      testLogger('');
      expect(lastMessage).toBe(formatExpected(''));
    });

    it('Single character', () => {
      testLogger('a');
      expect(lastMessage).toBe(formatExpected('a'));
    });

    it('List of strings', () => {
      testLogger(['test', 'test2', 'test3']);
      expect(lastMessage).toBe(formatExpected("[ 'test', 'test2', 'test3' ]"));
    });

    it('Multiple Parameters', () => {
      testLogger('this', 'is', 'a', 'test');
      expect(lastMessage).toBe(formatExpected('this is a test'));
    });

    it('JSON', () => {
      testLogger({ also: 'a', test: ':D' });
      expect(lastMessage).toBe(formatExpected("{ also: 'a', test: ':D' }"));
    });

    it('Number', () => {
      testLogger(0);
      expect(lastMessage).toBe(formatExpected('0'));
    });

    it('Function', () => {
      testLogger(() => {});
      expect(lastMessage).toBe(formatExpected('[Function]'));
    });

    it('Regex', () => {
      testLogger(/reaewr/g);
      expect(lastMessage).toBe(formatExpected('/reaewr/g'));
    });

    it('Error', () => {
      testLogger(new Error('Test error logging'));
      expect(lastMessage).toContain(formatExpected('Error: Test error logging'));
    });
  });
}
