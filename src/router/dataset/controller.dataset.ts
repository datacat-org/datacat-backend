import { Dataset } from "../../models/datasets.model";
import { uploadFileToLighthouse } from "../../handlers/lighthouse.handler";
import { Data } from "../../models/data.model";
import { distributeWork } from "../../handlers/distribution.handler";
import { Metric } from "../../models/metrics.model";
import { Annotator } from "../../models/annotators.model";

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

      await distributeWork(dataset._id, body.num_workers);

      return { data: dataset, status: 200, message: "Create dataset" };
    } catch (err: any) {
      console.log(err);
      return { status: 500, message: err.message };
    }
  }

  async reviewData(body: any) {
    try {
      const data_id: string = body.data_id;
      const nullifier_hash: string = body.nullifier_hash;
      const annotator: any = await Annotator.findOne({
        nullifier_hash: nullifier_hash,
      });

      if (!annotator) {
        return { status: 404, message: "Annotator not found" };
      }

      const metric = await Metric.create({
        data_id: data_id,
        annotaor_id: annotator._id,
        grade: body.grade,
      });

      // remove data from annotator's data_assigned
      await Annotator.updateOne(
        { _id: annotator._id },
        { $pull: { data_assigned: data_id } }
      );
      return { data: metric, status: 200, message: "Review data" };
    } catch (err: any) {
      console.log(err);
      return { status: 500, message: err.message };
    }
  }
}

export default new DatasetController();
