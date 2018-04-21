import { Sdk } from './SDK';

export interface Specification {
  readonly id: number; // Just an example field. Not necessarily part of Specification
  readonly title: string; // Just an example field. Not necessarily part of Specification
  readonly description?: string;
  readonly path: string;
  readonly sdks: Sdk[];
}
