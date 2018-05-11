import { Spec } from 'model/Spec';
import fetch from 'node-fetch';

const SWAGGER_CODEGEN_ENDPOINT = 'http://generator.swagger.io/api/gen/clients/';

export async function generateSdk(spec: Spec): Promise<any> {
  /* Generates an SDK for a specification 
  * @param {Spec} spec - The specification object for which the sdk needs to be generated
  * @return {Promise<string>} - The URL from which the sdk can be downloaded
  */

  console.log('generateSdk');
  const body = { swaggerUrl: spec.path };
  console.log(body);
  // TODO: Allow language selection, should be from Specification.
  const response = await fetch(SWAGGER_CODEGEN_ENDPOINT + 'python', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' }
  });
  const json = await response.json();
  if (json.type === 'error') {
    throw new Error(json.message);
  }
  return json;
}
