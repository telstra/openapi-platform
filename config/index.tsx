import { developmentConfig } from './development';
import { productionConfig } from './production';
import { testConfig } from './testCofing';

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
} else if (process.env.NODE_ENV === 'test') {
  configTemp = testConfig;
} else {
  throw new Error('Unknown environment type: ' + process.env.NODE_ENV);
}

export const config = configTemp as Configuration;
