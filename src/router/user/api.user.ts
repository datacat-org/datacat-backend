import { Router, Request, Response } from "express";
import UserController from "./controller.user";

const router: Router = Router();

//get all annotators
router.get("/", async (req: Request, res: Response) => {
  console.log("API path", `${req.originalUrl}-[${req.method}]`);
  const response = await UserController.getUsers(req.query);
  return res.status(response.status).json(response);
});

//create an annotator
router.post("/", async (req: Request, res: Response) => {
  console.log("API path", `${req.originalUrl}-[${req.method}]`);
  const response = await UserController.createUser(req.body);
  return res.status(response.status).json(response);
});

//get annotator by id
router.get("/:id", async (req: Request, res: Response) => {
  console.log("API path", `${req.originalUrl}-[${req.method}]`);
  const response = await UserController.getUserById(req.params);
  return res.status(response.status).json(response);
});

//update annotator by id
router.put("/:id", async (req: Request, res: Response) => {
  console.log("API path", `${req.originalUrl}-[${req.method}]`);
  const response = await UserController.updateUser(req.params, req.body);
  return res.status(response.status).json(response);
});

//delete annotator by id
router.delete("/:id", async (req: Request, res: Response) => {
  console.log("API path", `${req.originalUrl}-[${req.method}]`);
  const response = await UserController.deleteUser(req.params);
  return res.status(response.status).json(response);
});

//get all datasets for annotator
router.get("/:id/datasets", async (req: Request, res: Response) => {
  console.log("API path", `${req.originalUrl}-[${req.method}]`);
  const response = await UserController.getDatasets(req.params);
  return res.status(response.status).json(response);
});

//get all the data for the annotator for a particular dataset
router.get(
  "/:id/datasets/:dataset_id/data",
  async (req: Request, res: Response) => {
    console.log("API path", `${req.originalUrl}-[${req.method}]`);
    const response = await UserController.getData(req.params);
    return res.status(response.status).json(response);
  }
);

//get user data along with multiplier
router.get(
  "/:user_id/data/:dataset_id",
  async (req: Request, res: Response) => {
    console.log("API path", `${req.originalUrl}-[${req.method}]`);
    const response = await UserController.getUserData(req.params);
    return res.status(response.status).json(response);
  }
);

export default router;
