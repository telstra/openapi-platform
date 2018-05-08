export interface Sdk {
  id: number;
  client: string;
  version: string;
  buildStatus: BuildStatus;
}

export enum BuildStatus {
  NOTRUN,
  RUNNING,
  SUCCESS,
  FAIL
}
