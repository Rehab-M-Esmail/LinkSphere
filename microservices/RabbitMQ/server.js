const express = require("express");
const dotenv = require("dotenv");
const producer = require("./producer");
const consumer = require("./consumer");
dotenv.config({});
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/rmq");
app.post("/produce", async (req, res) => {
  await producer.PublishMessage(req, res);
  res.send();
});

const PORT = process.env.POST_SERVICE_PORT || 8000;
app.listen(PORT, () =>
  console.log(`Post Service Running on port http://localhost:${PORT}`)
);
