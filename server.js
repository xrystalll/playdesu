import * as dotenv from "dotenv";
dotenv.config();

import http from "http";
import express from "express";
import rateLimit from "express-rate-limit";

import router from "./routes/index.js";
import DB from "./modules/db.js";

const app = express();
const httpServer = http.createServer(app);

const PORT = process.env.PORT || 5000;

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: {
    type: "error",
    code: 429,
    message: "Too many requests per minute",
  },
});

app.use(express.static("public"));
app.use(express.json());
app.use("/", limiter);
app.use("/", router);

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    type: "error",
    code: err.status || 500,
    message: err.message || "Server error",
  });
});

DB()
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`Server run on ${PORT}`);
    });
  })
  .catch((e) => console.error(`Launch error: ${e}`));
