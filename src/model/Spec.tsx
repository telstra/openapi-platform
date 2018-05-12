import { Plan } from 'model/Plan';
export interface Spec {
  readonly title: string; // Just an example field. Not necessarily part of Spec
  readonly description?: string;
  readonly path: string;
}
export interface OldSpec extends Spec {
  readonly plans: Plan[];
}
