import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import getContent from "./app/gpt.js";
import getCheck from "./app/checker.js";

// Create __dirname equivalent for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./pages/index.html"));
});

app.post("/", async (req, res) => {
  const content = await getContent(req.body.instruction, req.body.title);
  const data = await getCheck(content);
  data.content = content;
  res.json(data);
});

app.listen(port, () => {
  console.log(`Server listening at port: ${port}`);
});
