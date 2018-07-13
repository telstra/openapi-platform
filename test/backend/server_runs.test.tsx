import rp from 'request-promise';
import { testConfig } from '../../config/testCofing';
import { createServer } from '../../src/backend/server';

/*
 * These tests may be a bit costly because it spins up the server and tests 
 * that is works. I split it up into another file so it can be easily added/removed
 * from the test suite.
 */
describe('test server runs', () => {
  let server;
  let response;
  beforeAll(async () => {
    // Runs the server on the test port.
    const app = await createServer();
    server = app.listen(testConfig.backend.port);
    response = await rp({
      url: `http://localhost:${testConfig.backend.port}/`,
      headers: {
        Accept: 'text/html',
      },
      resolveWithFullResponse: true,
    });
  });

  afterAll(() => {
    server.close();
  });

  test('server ran and response is OK', () => {
    expect(response.statusMessage).toBe('OK');
  });

  test('server served content', () => {
    expect(response.body.indexOf('<html')).not.toEqual(-1);
    expect(response.body.indexOf('Swagger UI')).not.toEqual(-1);
  });

  test('\\ endpoint redirects to \\ docs', async () => {
    expect(response.socket._httpMessage.path).toBe('/docs/?url=/docs');
  });
});
