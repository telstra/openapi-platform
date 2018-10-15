import feathers from '@feathersjs/client';
import io from 'socket.io-client';

// TODO: Fill this in at some point
export interface ServerClient {
  [key: string]: any;
}

/**
 * A client used to communicate to the server via websockets.
 * It's intended that the frontend uses this to communicate to the backend.
 * Right now just wraps a feathers app.
 */
export function createServerClient(url): ServerClient {
  const socket = io(url, {
    transports: ['websocket'],
  });
  const app = feathers();
  app.configure(
    feathers.socketio(socket, {
      // TODO: Definately shouldn't be this long
      timeout: 60000,
    }),
  );
  // TODO: Actually wrap client rather than just returning client
  return { client: app, socket };
}
