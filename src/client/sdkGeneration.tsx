import fetch from 'node-fetch';

import { Specification } from 'model/Specification';

const SWAGGER_CODEGEN_ENDPOINT = 'http://generator.swagger.io/api/gen/clients/';
const BAD_SPECIFICATION = 'Error: Bad specification';

export async function generateSdk(spec: Specification): Promise<any> {
  /* Generates an SDK for a specification
  * @param {Specification} spec - The specification object for which the sdk needs to be generated
  * @return {Promise<string>} - The URL from which the sdk can be downloaded
  */

  /* tslint:disable:no-console */
  // TODO: Use a logging framework instead of console.log

  console.log('generateSdk');
  const body = { swaggerUrl: spec.path };
  console.log(body);
  // TODO: Allow language selection, should be from Specification.
  const response = await fetch(SWAGGER_CODEGEN_ENDPOINT + 'python', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' }
  });
  const fulfilled = await response.json();
  console.log(fulfilled);
  if (fulfilled.type === 'error') {
    return BAD_SPECIFICATION;
  }
  return fulfilled.link;
}
