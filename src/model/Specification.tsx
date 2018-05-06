import { Sdk } from 'model/Sdk';

export interface Specification {
  readonly id: number; // Just an example field. Not necessarily part of Specification
  readonly title: string; // Just an example field. Not necessarily part of Specification
  readonly description?: string;
  readonly path: string;
  readonly sdks?: Sdk[]; // TODO: Probably shouldn't be optional but it is for now
}
