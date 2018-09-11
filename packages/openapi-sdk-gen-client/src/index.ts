import fetch from 'node-fetch';

import { HasId } from '@openapi-platform/model';
import { SdkConfig } from '@openapi-platform/model';
import { Sdk } from '@openapi-platform/model';
import { Spec } from '@openapi-platform/model';

const SWAGGER_CODEGEN_ENDPOINT = 'http://generator.swagger.io/api/gen/clients/';

/** Generates an SDK for a given Spec following the given SdkConfig.
 * @param {HasId<Spec>} spec - The Spec object for which the SDK needs to be generated
 * @param {HasId<SdkConfig>} sdkConfig - The SdkConfig object describing how to generate the SDK
 * @return {Promise<Sdk>} - The generated SDK
 */
export async function generateSdk(
  logger,
  spec: HasId<Spec>,
  sdkConfig: HasId<SdkConfig>,
): Promise<Sdk> {
  const body = { swaggerUrl: spec.path, options: sdkConfig.options };
  const response = await fetch(SWAGGER_CODEGEN_ENDPOINT + sdkConfig.target, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
  const json = await response.json();
  if (json.type === 'error') {
    throw new Error(json.message);
  }
  return {
    path: json.link,
    sdkConfigId: sdkConfig.id,
  };
}
