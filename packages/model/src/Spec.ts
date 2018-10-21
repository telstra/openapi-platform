import { Timestamped } from './Timestamped';

/**
 * Represents a Swagger specification.
 */
export interface Spec extends Timestamped {
  /**
   * The name of the specification.
   */
  readonly title: string;

  /**
   * A description of the specification.
   */
  readonly description?: string;

  /**
   * A URL to the Swagger specification.
   */
  readonly path: string;
}
