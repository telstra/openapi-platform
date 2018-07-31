import { logger } from 'backend/logger';
import MockDate from 'mockdate';

// Set timezone to const value then adjust for timezone
MockDate.set('2018-05-03T12:34:56z');
const tempdate = new Date();
const adjustedTime = tempdate.getTime() + tempdate.getTimezoneOffset() * 60 * 1000;
MockDate.set(adjustedTime);

// replace stdout.write so we can capture output
let lastMessage = '';
const old_write = process.stdout.write;
process.stdout.write = (function(write) {
  return function(string, encoding, fd) {
    write.apply(process.stdout, arguments);
    lastMessage = string.strip.trim();
  };
})(process.stdout.write);

const loggerNames = ['debug', 'info', 'warn'];
const loggers = [logger.debug, logger.info, logger.warn];

for (let i = 0; i < loggerNames.length; i++) {
  const name = loggerNames[i];
  const testLogger = loggers[i];

  function formatExpected(expectedString) {
    const prefix: String = '2018-05-03 12:34:56 ';
    const padding: String = ' '.repeat(9 - name.length);
    const output: String = (prefix + name + padding + expectedString).strip.trim();
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
      expect(lastMessage).toBe(formatExpected('Error: Test Error Logging'));
    });
  });
}
