import { developmentConfig } from './development';
import { productionConfig } from './production';

interface Configuration {
  /**
   * Frontend configuration options.
   */
  readonly frontend: {
    /**
     * The base API URL used for all requests.
     */
    readonly baseApiUrl: string;
  };

  /**
   * Backend configuration options.
   */
  readonly backend: {
    /**
     * The port number used for incoming connections.
     */
    readonly port: number;

    /**
     * Whether or not CORS requests should be allowed.
     */
    readonly useCors: boolean;
  };
}

let configTemp: Configuration | undefined;
if (process.env.NODE_ENV === 'development') {
  configTemp = developmentConfig;
} else if (process.env.NODE_ENV === 'production') {
  configTemp = productionConfig;
} else {
  throw new Error('Unknown environment type');
}

export const config = configTemp as Configuration;
