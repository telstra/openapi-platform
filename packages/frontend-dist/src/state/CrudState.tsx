import { Id, HasId } from '@openapi-platform/model';
export interface CrudState<T> {
  service;
  entities: Map<Id, HasId<T>>;
}
