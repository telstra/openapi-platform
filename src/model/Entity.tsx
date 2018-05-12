export type Id = number;
export interface Identifiable {
  id: Id;
}
export type HasId<T> = Identifiable & T;
