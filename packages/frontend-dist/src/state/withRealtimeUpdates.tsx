import { action } from 'mobx';

import { HasId, Timestamped } from '@openapi-platform/model';
import { incomingIsNewer } from './incomingIsNewer';

import { CrudState } from './CrudState';

/**
 * Helper method for pushing entities from the realtime featherjs API, to a map of ids to entities
 * @param service A featherjs service
 * @param entities A map of ids to whatever entity is stored in the service
 */
export function withRealtimeUpdates<T extends Timestamped, S extends CrudState<T>>(
  state: S,
): S {
  const addIfNewerEntities = action((entity: HasId<T>) => {
    if (incomingIsNewer(state.entities.get(entity.id), entity)) {
      state.entities.set(entity.id, entity);
    }
  });
  ['created', 'patched', 'updated'].forEach(event => {
    state.service.on(event, e => {
      addIfNewerEntities(e);
    });
  });
  state.service.on(
    'removed',
    action((entity: HasId<T>) => {
      state.entities.delete(entity.id);
    }),
  );
  return state;
}
