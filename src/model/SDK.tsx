export interface SDK {
  id: number;
  name: string;
  latestVersion: string;
  buildStatus: BuildStatus;
}

export enum BuildStatus {
  NOTRUN,
  RUNNING,
  SUCCESS,
  FAIL
}
