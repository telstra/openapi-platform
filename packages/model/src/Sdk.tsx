import { Id } from './Id';

/**
 * Represents an SDK that has been built from an SDK configuration for a specification.
 */
export interface Sdk {
  /**
   * The ID of the SDK configuration the SDK was built for.
   */
  sdkConfigId: Id;

  /**
   * A URL to a download link for the SDK.
   */
  path: string;
}
