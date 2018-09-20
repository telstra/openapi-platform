import { Id } from './Id';
import { BuildStatus } from './SdkConfig';

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

  /**
   * The current build status of the SDK.
   */
  buildStatus: BuildStatus;

  /**
   * If the build status is FAIL, buildError will contain the
   * error message.
   */
  buildError?: string;
}
