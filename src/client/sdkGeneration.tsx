import { Specification } from 'model/Specification';
import fetch from 'node-fetch';

const SWAGGER_CODEGEN_ENDPOINT = 'http://generator.swagger.io/api/gen/clients/';
const BAD_SPECIFICATION = 'Error: Bad specification';

export async function generateSdk(spec: Specification): Promise<any> {
  /* Generates an SDK for a specification 
  * @param {Specification} spec - The specification object for which the sdk needs to be generated
  * @return {Promise<string>} - The URL from which the sdk can be downloaded
  */

  // TODO: Get it working for .yaml files like below.
  // 'https://github.com/OAI/OpenAPI-Specification/blob/master/examples/v2.0/yaml/uber.yaml' }
  console.log('generateSdk');
  let body = { swaggerUrl: spec.path };
  console.log(body);
  let response = await fetch(SWAGGER_CODEGEN_ENDPOINT + 'python', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' }
  });
  let fulfilled = await response.json();
  console.log(fulfilled);
  if (fulfilled.type == 'error') {
    return BAD_SPECIFICATION;
  }
  return fulfilled.link;
}
