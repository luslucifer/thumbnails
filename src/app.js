const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
require("dotenv").config();

const middlewares = require("./middlewares");
const api = require("./api");
const Thumbnails = require("./functions/thubnail"); // Correctly import Thumbnails

const app = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "🦄🌈✨👋🌎🌍🌏✨🌈🦄 i am samir",
  });
});

app.get("/thumbnails/:id", async (req, res) => {
  const ss = req.query.ss || null;
  const ep = req.query.ep || null;
  const id = req.params.id;
  const t = new Thumbnails(id, ss, ep);

  try {
    const thumbnailUrl = await t.main();
    res.send({  id: id, ss: ss, ep: ep,thubnail: thumbnailUrl });
  } catch (error) {
    console.error("Error fetching thumbnail:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.use("/api/v1", api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;
