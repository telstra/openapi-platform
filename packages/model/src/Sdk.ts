import { Id } from './Id';
import { Timestamped } from './Timestamped';

export function isRunning(buildStatus: BuildStatus) {
  return ![BuildStatus.Fail, BuildStatus.Success, BuildStatus.NotRun].includes(
    buildStatus,
  );
}

/**
 * Represents the different possible build statuses of an SDK configuration.
 */
export enum BuildStatus {
  NotRun = 'NOT_RUN',
  Building = 'BUILDING', // Building OpenAPI Spec SDK
  Cloning = 'CLONING', // Cloning Sdk repo
  Staging = 'STAGING', // Staging new files into Sdk repo
  Pushing = 'PUSHING', // Pushing Sdk repo changes
  Success = 'SUCCESS',
  Fail = 'FAIL',
}

export const hasValidBuildStatus = buildStatus =>
  Object.values(BuildStatus).includes(buildStatus);

export interface PathHolder {
  fileId: string;
}

export type HasPath<T> = T & PathHolder;

/**
 * Represents an SDK that has been built from an SDK configuration for a specification.
 */
export interface Sdk extends Timestamped {
  /**
   * The ID of the SDK configuration the SDK was built for.
   */
  sdkConfigId: Id;

  /**
   * What stage the Sdk build process is up to
   */
  buildStatus: BuildStatus;
}
