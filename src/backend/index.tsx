import express from '@feathersjs/express';
import feathers from '@feathersjs/feathers';
import socketio from '@feathersjs/socketio';
import { config } from 'config';
import cors from 'cors';
import memory from 'feathers-memory';
import swagger from 'feathers-swagger';

import { dummySpecifications } from 'backend/dummySpecifications';
import { generateSdk } from 'client/sdkGeneration';
import { Specification } from 'model/Specification';

async function run(runPort: number) {
  const specifications = memory();
  specifications.docs = {
    description: 'Swagger/OpenAPI specifications',
    definitions: {
      specifications: {
        type: 'object',
        additionalProperties: true,
      },
      'specifications list': {
        type: 'array',
      },
    },
  };
  const app: express.Express = express(feathers());
  app
    .use(express.json())
    .use(express.urlencoded({ extended: true }))
    .configure(express.rest())
    .configure(socketio())
    .configure(
      swagger({
        docsPath: '/docs',
        uiIndex: true,
        info: {
          title: 'Swagger Platform',
          description: 'TODO: Someone describe swagger-platform :)',
        },
      }),
    )
    .get('/', (req, res) => res.redirect('/docs'))
    .use('/specifications', specifications)
    .use(express.errorHandler());
  for (const specification of dummySpecifications) {
    await app.service('specifications').create(specification);
  }
  // Enables CORS requests if configured to do so
  if (config.backend.useCors) {
    app.use(cors());
  }

  /** API method to generate an sdk for a given specification
   * @param {string} req.body.id - ID of the specification to generate the SDK for
   * @return {Promise<string>} - The URL that the SDK can be downloaded from
   */
  app.post('/generatesdk', async (req, res) => {
    const specificationId: number = req.body.id;
    const spec: Specification | undefined = await app
      .service('specifications')
      .get(specificationId);

    if (spec !== undefined) {
      const sdkUrl: string = await generateSdk(spec);
      res.json({
        status: 'success',
        url: sdkUrl,
      });
    } else {
      res.json({
        status: 'failure',
      });
    }
  });

  app.listen(runPort);
}

const envPort: string | undefined = process.env.PORT;
const port: number = envPort ? Number.parseInt(envPort) : config.backend.port;
run(port);
