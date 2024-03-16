if (process.env.NODE_ENV === "development") {
  const dotenv = require("dotenv");
  dotenv.config();
}

import express, { Express, Request, Response } from "express";
import cors from "cors";
import mongodbInstance from "./handlers/mongodb.handler";

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

//import helmet
import helmet from "helmet";
app.use(helmet());

// db connection
(async () => {
  try {
    // Connect to database
    mongodbInstance.on("error", (error) => {
      console.error("Database connection error:", error);
    });

    mongodbInstance.once("open", () => {
      console.log("Connected to the database");
    });
  } catch (err: any) {
    console.log(err);
  }
})();

// health check
app.get("/health", (_, res: Response) => {
  res.status(200).send("OK");
});

//user routes
import userRouter from "./router/user/api.user";
app.use("/api/user", userRouter);

//dataset routes
import datasetRouter from "./router/dataset/api.dataset";
app.use("/api/dataset", datasetRouter);

//economy routes
import economyRouter from "./router/economy/api.economy";
app.use("/api/economy", economyRouter);

// error handling
app.use((err: any, _: Request, res: Response, __: any) => {
  console.error(err);
  res.status(err.status || 500).end(err.message);
});

const port = process.env.PORT || 8081;

app.listen(port, () => {
  console.log("App listening on port " + port);
});
