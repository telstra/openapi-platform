import express from 'express';
console.log(express);
import http from 'http';
import { join } from 'path';
async function run(port: number) {
  const app: express.Express = express();
  console.log(app);
  app.use('/static', express.static(join(__dirname, '../../dist')));
  app.get('/', (req, res) => {
    res.redirect('/static/index.html');
  });
  app.listen(port);
}
run(1337);