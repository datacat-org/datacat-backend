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
  upload.array("files", 100),
  async (req: Request, res: Response) => {
    console.log("API path", `${req.originalUrl}-[${req.method}]`);
    const response = await DatasetController.createDataset(req.body, req.files);
    return res.status(response.status).json(response);
  }
);

//create labeled data
router.post(
  "/labeled",
  upload.array("files", 100),
  async (req: Request, res: Response) => {
    console.log("API path", `${req.originalUrl}-[${req.method}]`);
    const response = await DatasetController.createLabeledData(
      req.body,
      req.files
    );
    return res.status(response.status).json(response);
  }
);

//get data to annotate
router.get("/annotate", async (req: Request, res: Response) => {
  console.log("API path", `${req.originalUrl}-[${req.method}]`);
  const response = await DatasetController.getDataToAnnotate(req.query);
  return res.status(response.status).json(response);
});

//review a datapoint
router.post("/review", async (req: Request, res: Response) => {
  console.log("API path", `${req.originalUrl}-[${req.method}]`);
  const response = await DatasetController.reviewData(req.body);
  return res.status(response.status).json(response);
});

//mark dataset as reviewed and deploy tokens
router.post("/reviewed", async (req: Request, res: Response) => {
  console.log("API path", `${req.originalUrl}-[${req.method}]`);
  const response = await DatasetController.markReviewedAndProcess(req.body);
  return res.status(response.status).json(response);
});

//distribute funds to annotators
router.post("/distribute", async (req: Request, res: Response) => {
  console.log("API path", `${req.originalUrl}-[${req.method}]`);
  const response = await DatasetController.distributeFunds(req.body);
  return res.status(response.status).json(response);
});
export default router;
