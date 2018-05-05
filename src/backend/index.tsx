import cors from 'cors';
import { config } from 'config';
import { generateSdk } from 'client/sdkGeneration';
import { Specification } from 'model/Specification';
import { dummySpecifications } from 'backend/dummySpecifications';
import feathers from '@feathersjs/feathers';
import express from '@feathersjs/express';
import socketio from '@feathersjs/socketio';
import Sequelize from 'sequelize';
import memory from 'feathers-memory';
async function run(port: number) {
  const sequelize = new Sequelize('sequelize', '', '', {
    dialect: 'postgres',
    storage: './db.postgres',
    loggin: true
  });
  const app: express.Express = express(feathers());
  app.use(express.json());
  app.configure(express.rest());
  app.configure(socketio());
  app.use('/specifications', memory({}));
  for (const specification of dummySpecifications) {
    await app.service('specifications').create(specification);
  }
  // Enables CORS requests if configured to do so
  if (config.backend.useCors) {
    app.use(cors());
  }
  app.use(express.errorHandler());

  app.get('/', (req, res) => {
    res.json({
      status: 'Success',
      message: 'It works!'
    });
  });

  /** API method to generate an sdk for a given specification
   * @param {string} req.body.id - ID of the specification to generate the SDK for
   * @return {Promise<string>} - The URL that the SDK can be downloaded from
   */
  app.post('/generatesdk', async (req, res) => {
    const specificationId: number = req.body.id;
    var spec: Specification | undefined = await app
      .service('specifications')
      .get(specificationId);

    if (spec != undefined) {
      const sdkUrl: String = await generateSdk(spec);
      res.json({
        status: 'success',
        url: sdkUrl
      });
    } else {
      res.json({
        status: 'failure'
      });
    }
  });

  app.listen(port);
}
const envPort: string | undefined = process.env.PORT;
const port: number = envPort ? Number.parseInt(envPort) : config.backend.port;
run(port);
