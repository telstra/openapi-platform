import { HasId } from 'model/Entity';
import { Sdk } from 'model/Sdk';
export interface Spec {
  readonly title: string; // Just an example field. Not necessarily part of Specification
  readonly description?: string;
  readonly path: string;
}
export interface OldSpec extends Spec {
  readonly sdks: Sdk[];
}
