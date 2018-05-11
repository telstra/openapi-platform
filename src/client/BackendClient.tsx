import feathers from '@feathersjs/client';
import io from 'socket.io-client';

// TODO: Fill this in at some point
export interface BackendClient {
  [key: string]: any;
}
export function createBackendClient(): BackendClient {
  const socket = io('http://localhost:8080', {
    transports: ['websocket']
  });
  const app = feathers();
  app.configure(feathers.socketio(socket));
  // TODO: Actually wrap app rather than just returning app
  return app;
}
export const client = createBackendClient();
