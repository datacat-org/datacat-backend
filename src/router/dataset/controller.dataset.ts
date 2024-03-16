import { Dataset } from "../../models/datasets.model";
import { uploadFileToLighthouse } from "../../handlers/lighthouse.handler";
import { Data } from "../../models/data.model";
import { distributeWork } from "../../handlers/distribution.handler";
import { Metric } from "../../models/metrics.model";
import { Annotator } from "../../models/annotators.model";
import mongoose from "mongoose";

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
      const dataset = await Dataset.create({
        ...body,
        nums_rows: files.length,
      });
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

      await distributeWork(dataset._id);

      return { data: dataset, status: 200, message: "Create dataset" };
    } catch (err: any) {
      console.log(err);
      return { status: 500, message: err.message };
    }
  }

  async getDataToAnnotate(body: any) {
    try {
      const dataset_id: string = body.dataset_id;
      const annotator_id: string = body.annotator_id;
      const annotator = await Annotator.findById(annotator_id);
      if (!annotator) {
        return { status: 404, message: "Annotator not found" };
      }
      const dataset = await Dataset.find({ dataset_id: dataset_id });
      if (!dataset) {
        return { status: 404, message: "Dataset not found" };
      }

      //figure out whether the user gets labeled or unlabelled data
      const random = Math.floor(Math.random() * 10) + 1;
      console.log(random);
      let data_left: any;
      if (random < 3) {
        data_left = await Data.find({
          dataset_id: dataset_id,
          is_labeled: true,
        });
      } else {
        data_left = await Data.find({
          dataset_id: dataset_id,
          is_labeled: false,
          status: "PENDING",
        });
      }

      console.log(data_left.length);

      //select random entry from data_left
      const data_length = data_left.length;
      if (data_length === 0) {
        return { status: 404, message: "No data to annotate" };
      }
      const random2 = Math.floor(Math.random() * data_length);
      const data = data_left[random2];
      return {
        data: data,
        status: 200,
        message: "Get data to annotate",
      };
    } catch (err: any) {
      console.log(err);
      return { status: 500, message: err.message };
    }
  }

  async reviewData(body: any) {
    try {
      const data_id: string = body.data_id;
      const user_id: string = body.user_id;
      const annotator: any = await Annotator.findById(user_id);

      if (!annotator) {
        return { status: 404, message: "Annotator not found" };
      }

      const metric = await Metric.create({
        data_id: data_id,
        annotaor_id: annotator._id,
        grade: body.grade,
      });

      const new_data: any = await Data.findOneAndUpdate(
        { _id: data_id },
        { status: "REVIEWED" },
        { new: true }
      );

      const new_dataset: any = await Dataset.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(new_data.dataset_id) },
        { $inc: { times_annotated: 1 } },
        { new: true }
      );

      console.log(new_dataset);
      if (new_dataset.times_annotated >= new_dataset.nums_row) {
        await Dataset.updateOne(
          { _id: new mongoose.Types.ObjectId(new_data.dataset_id) },
          { status: "REVIEWED" },
          { new: true }
        );
      }

      return { data: metric, status: 200, message: "Review data" };
    } catch (err: any) {
      console.log(err);
      return { status: 500, message: err.message };
    }
  }
}

export default new DatasetController();
