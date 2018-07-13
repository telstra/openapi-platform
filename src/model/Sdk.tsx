import { Id } from 'model/Entity';

/**
 * Represents an SDK that has been built from a plan for a specification.
 */
export interface Sdk {
  /**
   * A URL to a download link for the SDK.
   */
  path: string;

  /**
   * The ID of the plan the SDK was built for.
   */
  planId: Id;
}
