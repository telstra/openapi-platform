import { HasId, Id } from 'model/Entity';

export interface Plan {
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
