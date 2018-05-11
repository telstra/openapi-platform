import { HasId, Id } from 'model/Entity';

export interface Sdk {
  name: string;
  latestVersion: string;
  buildStatus: BuildStatus;
  info: any; // The response from the SDK generation request (TODO: Give this a type)
  specId: Id;
}

export enum BuildStatus {
  NOTRUN,
  RUNNING,
  SUCCESS,
  FAIL
}

export interface SdkResponse {}
