import { Router, Request, Response } from "express";
import DatasetController from "./controller.dataset";
import upload from "../../handlers/multer.handler";

const router: Router = Router();

//get all datasets
router.get("/", async (req: Request, res: Response) => {
  console.log("API path", `${req.originalUrl}-[${req.method}]`);
  const response = await DatasetController.getDatasets(req.query);
  return res.status(response.status).json(response);
});

//create a dataset
router.post(
  "/",
  upload.array("files", 5),
  async (req: Request, res: Response) => {
    console.log("API path", `${req.originalUrl}-[${req.method}]`);
    const response = await DatasetController.createDataset(req.body, req.files);
    return res.status(response.status).json(response);
  }
);

export default router;
