import { Router, Request, Response } from "express";
import EconomyController from "./controller.economy";

const router: Router = Router();

//get datasets for sale
router.get("/datasets", async (req: Request, res: Response) => {
  console.log("API path", `${req.originalUrl}-[${req.method}]`);
  const response = await EconomyController.getDatasets(req.query);
  return res.status(response.status).json(response);
});

//buy a dataset
router.post("/buy", async (req: Request, res: Response) => {
  console.log("API path", `${req.originalUrl}-[${req.method}]`);
  const response = await EconomyController.buyDataset(req.body);
  return res.status(response.status).json(response);
});

//create a consumer
router.post("/consumer", async (req: Request, res: Response) => {
  console.log("API path", `${req.originalUrl}-[${req.method}]`);
  const response = await EconomyController.createConsumer(req.body);
  return res.status(response.status).json(response);
});

export default router;
