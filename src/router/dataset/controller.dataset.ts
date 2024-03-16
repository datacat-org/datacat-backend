import { Dataset } from "../../models/datasets.model";
import { uploadFileToLighthouse } from "../../handlers/lighthouse.handler";
import { Data } from "../../models/data.model";

class DatasetController {
  async getDatasets(query: any) {
    try {
      const datasets = await Dataset.find(query);
      return { data: datasets, status: 200, message: "Get all datasets" };
    } catch (err: any) {
      console.log(err);
      return { status: 500, message: err.message };
    }
  }
  async createDataset(body: any, files: any) {
    try {
      const dataset = await Dataset.create(body);
      //multer code to upload multiple files
      const uploaded_files = await Promise.all(
        files.map((file: any) => {
          return uploadFileToLighthouse(file.buffer);
        })
      );

      await Promise.all(
        uploaded_files.map((data: any) => {
          return Data.create({ dataset_id: dataset._id, cid: data.data.Hash });
        })
      );

      return { data: dataset, status: 200, message: "Create dataset" };
    } catch (err: any) {
      console.log(err);
      return { status: 500, message: err.message };
    }
  }
}

export default new DatasetController();
