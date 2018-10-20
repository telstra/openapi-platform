import { Timestamped } from '@openapi-platform/model';
/**
 * Since real-time updates don't necessarily come in order, we have to check if an update
 * is newer than the what we already have.
 * @param original The original entity, if one exists
 * @param incoming The one that you're comparing it against
 * @returns True if the incoming entity is newer
 */
export function incomingIsNewer<T extends Timestamped>(
  original: T | undefined,
  incoming: T,
): boolean {
  if (!original) {
    return true;
  } else if (original.updatedAt && incoming.updatedAt) {
    return original.updatedAt < incoming.updatedAt;
  } else if (original.updatedAt) {
    return false;
  } else if (incoming.updatedAt) {
    return true;
  } else {
    return original.createdAt < incoming.createdAt;
  }
}
