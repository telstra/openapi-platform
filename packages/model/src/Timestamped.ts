export interface Timestamped {
  // TODO: Technically, the frontend receives dates as strings so we need to add a hook to convert it
  createdAt: Date;
  updatedAt?: Date;
}
