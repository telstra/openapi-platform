import { HasId, Id } from '@openapi-platform/model';
import { action } from 'mobx';
/**
 * Helper method for pushing entities from the realtime featherjs API, to a map of ids to entities
 * @param service A featherjs service
 * @param entities A map of ids to whatever entity is stored in the service
 */
export function updateStateInRealtime<T extends {}>(
  service,
  entities: Map<Id, HasId<T>>,
) {
  service.on(
    'created',
    action((sdkConfig: HasId<T>) => {
      entities.set(sdkConfig.id, sdkConfig);
    }),
  );
  service.on(
    'patched',
    action((entity: HasId<Partial<T>>) => {
      const originalEntity = entities.get(entity.id);
      // TODO: Consider retrieving the entity if it doesn't already exist in state
      if (originalEntity) {
        // Spread wasn't working. See https://github.com/Microsoft/TypeScript/issues/22687
        entities.set(entity.id, Object.assign(originalEntity, entity));
      }
    }),
  );
  service.on(
    'removed',
    action((sdkConfig: HasId<T>) => {
      service.delete(sdkConfig.id);
    }),
  );
  service.on(
    'updated',
    action((sdkConfig: HasId<T>) => {
      service.set(sdkConfig.id, sdkConfig);
    }),
  );
}
