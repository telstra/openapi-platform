import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { config } from 'config';
import { generateSdk } from 'client/sdkGeneration';
import { Specification } from 'model/Specification';
import {
  getSpecificationById,
  getSpecifications,
  addSpecification
} from 'backend/specifications';

async function run(port: number) {
  const app: express.Express = express();
  app.use(bodyParser.json());

  // Enables CORS requests if configured to do so
  if (config.backend.useCors) {
    app.use(cors());
  }

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
    var spec: Specification | undefined = getSpecificationById(specificationId);

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

  /** API Method to add a specification
   * @param {string} req.body.title - the title of specification
   * @param {string} req.body.path - the path to the specification file
   * @param {string} req.body.description - optional description of the specification
   * @return {Promise<Specification>} - The Specification that was created
   */
  app.post('/addspecification', async (req, res) => {
    const title: string = req.body.title;
    const path: string = req.body.path;
    const description: string = req.body.string;
    let spec: Specification;
    if (description) {
      spec = addSpecification(title, path, description);
    } else {
      spec = addSpecification(title, path);
    }
    res.json(spec);
  });

  /** API Method to return the list of specifications
   * @return {Promise<Specification[]>} - The array of stored Specifications
   */
  app.post('/getspecifications', async (req, res) => {
    res.json(getSpecifications());
  });

  app.listen(port);
}
const envPort: string | undefined = process.env.PORT;
const port: number = envPort ? Number.parseInt(envPort) : config.backend.port;
run(port);
