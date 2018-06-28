import fetch from 'node-fetch';

import { Plan } from 'model/Plan';
import { Spec } from 'model/Spec';

const SWAGGER_CODEGEN_ENDPOINT = 'http://generator.swagger.io/api/gen/clients/';

export async function generateSdk(logger, spec: Spec, plan: Plan): Promise<any> {
  /* Generates an SDK for a Spec
  * @param {Spec} spec - The Spec object for which the sdk needs to be generated
  * @return {Promise<string>} - The URL from which the sdk can be downloaded
  */

  const body = { swaggerUrl: spec.path };
  logger.log(body);
  const response = await fetch(SWAGGER_CODEGEN_ENDPOINT + plan.target, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
  const json = await response.json();
  if (json.type === 'error') {
    throw new Error(json.message);
  }
  return json;
}
