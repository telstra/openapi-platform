import { ComponentType } from 'react';
export interface Category<T> {
  readonly name?: string;
  readonly Component: ComponentType<T>;
  readonly stories: Stories<T>;
  readonly description?: string;
}
export interface Stories<T> {
  [key: string]: T;
}
