import feathers from '@feathersjs/client';
import io from 'socket.io-client';

// TODO: Fill this in at some point
export interface BackendClient {
  [key: string]: any;
}

/**
 * A pure feathers client used to communicate to the server via websockets.
 * It's intended that the frontend uses this to communicate to the backend.
 */
export function createBackendClient(): BackendClient {
  const socket = io('http://localhost:8080', {
    transports: ['websocket'],
  });
  const app = feathers();
  app.configure(feathers.socketio(socket));
  // TODO: Actually wrap client rather than just returning client
  return app;
}

export const client = createBackendClient();
