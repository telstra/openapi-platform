import { HasId, Id } from 'model/Entity';

export interface Sdk {
  name: string;
  latestVersion: string;
  buildStatus: BuildStatus;
  specId: Id;
}

export enum BuildStatus {
  NOTRUN,
  RUNNING,
  SUCCESS,
  FAIL
}

export interface SdkResponse {}
