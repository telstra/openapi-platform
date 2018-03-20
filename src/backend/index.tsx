import express from "express";
import http from "http";
import { join } from "path";
async function run(port: number) {
  const app: express.Express = express();
  app.use("/static", express.static(join(__dirname, "../../dist")));
  app.get("/", (req, res) => {
    res.redirect("/static/index.html");
  });
  app.listen(port);
}
run(1337);
