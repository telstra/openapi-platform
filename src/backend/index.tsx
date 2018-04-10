import express from 'express';
import { generateSdk } from 'client/sdkGeneration';
import bodyParser from 'body-parser';
import { Specification } from 'model/Specification';
import { getSpecificationById, getSpecifications } from 'backend/specifications';

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

  app.listen(port);
}
const envPort: string | undefined = process.env.PORT;
const port: number = envPort ? Number.parseInt(envPort) : 8080;
run(port);
