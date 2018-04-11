import express from 'express';
import { generateSdk } from 'client/sdkGeneration';
import bodyParser from 'body-parser';
import { Specification } from 'model/Specification';
import {
  getSpecificationById,
  getSpecifications,
  addSpecification
} from 'backend/specifications';

async function run(port: number) {
  const app: express.Express = express();
  app.use(bodyParser.json());
  app.get('/', (req, res) => {
    res.json({
      status: 'Success',
      message: 'It works!'
    });
  });

  /* API method to generate an sdk for a given specification
  * @params {string} req.body.id - ID of the specification to generate the SDK for
  * @return {Promise<string>} - The URL that the SDK can be downloaded from
  */
  app.post('/generatesdk', async (req, res) => {
    const specificationId: number = req.body.id;
    var spec: Specification | undefined = getSpecificationById(specificationId);

    if (spec != undefined) {
      const sdkUrl: String = await generateSdk(spec);
      res.send(sdkUrl);
    } else {
      res.statusCode = 404;
      res.send(null);
    }
  });

  /* API Method to add a specification
   * @params {string} req.body.title - optional parameter to specify title of Specification
   * @return {Promise<Specification>} - The Specification that was created
   */
  app.post('/addspecification', async (req, res) => {
    const title: string = req.body.title;
    let spec: Specification;
    if (title) {
      spec = addSpecification(title);
    } else {
      spec = addSpecification();
    }
    res.send(spec);
  });

  app.listen(port);
}
const envPort: string | undefined = process.env.PORT;
const port: number = envPort ? Number.parseInt(envPort) : 8080;
run(port);
