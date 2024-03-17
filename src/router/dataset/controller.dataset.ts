import { Dataset } from "../../models/datasets.model";
import { Data } from "../../models/data.model";
import { Metric } from "../../models/metrics.model";
import { Annotator } from "../../models/annotators.model";
import mongoose from "mongoose";
import { AnnotatorDataset } from "../../models/annotatorDataset.model";
import { uploadFileToLighthouse } from "../../handlers/lighthouse.handler";
import {
  deployCircleContract,
  setShareHolders,
  distributeFunds,
  getContractAddress,
} from "../../handlers/circle.handler";
import { getDatasetAnnotators } from "./utils.dataset";
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
      const deployedContract = await deployCircleContract(
        body.name,
        body.description
      );
      const dataset = await Dataset.create({
        ...body,
        nums_rows: files.length,
        contractId: deployedContract.contractId,
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

      return { data: dataset, status: 200, message: "Create dataset" };
    } catch (err: any) {
      console.log(err);
      return { status: 500, message: err.message };
    }
  }

  async createLabeledData(body: any, files: any) {
    try {
      const dataset_id: string = body.dataset_id;
      const uploaded_files = await Promise.all(
        files.map((file: any) => {
          return uploadFileToLighthouse(file.buffer);
        })
      );

      console.log(body.labels);

      await Promise.all(
        uploaded_files.map((data: any, idx: number) => {
          return Data.create({
            dataset_id: dataset_id,
            cid: data.data.Hash,
            is_labeled: true,
            label: +body.labels[idx],
          });
        })
      );
      return { status: 200, message: "Create labeled data" };
    } catch (err: any) {
      console.log(err);
      return { status: 500, message: err.message };
    }
  }
  async getDataToAnnotate(query: any) {
    try {
      const dataset_id: string = query.dataset_id;
      const annotator_id: string = query.annotator_id;
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

      //do multiplier calcs
      let annotator_dataset: any;
      if (new_data.is_labeled) {
        const grade = body.grade;
        const label = new_data.label;
        const percentage_diff = Math.abs(grade - label) / label;
        console.log(percentage_diff, grade, label);
        const multiplier = 100 - 100 * percentage_diff;
        annotator_dataset = await AnnotatorDataset.findOneAndUpdate(
          { annotator_id: annotator._id, dataset_id: new_dataset.dataset_id },
          {
            multiplier: multiplier,
            annotator_id: annotator._id,
            dataset_id: new_dataset._id,
          },
          { upsert: true, new: true }
        );
      } else {
        annotator_dataset = await AnnotatorDataset.findOneAndUpdate(
          { annotator_id: annotator._id, dataset_id: new_dataset.dataset_id },
          {
            annotator_id: annotator._id,
            dataset_id: new_dataset._id,
          },
          { upsert: true, new: true }
        );
      }

      if (new_dataset.times_annotated >= new_dataset.nums_row) {
        await Dataset.findOneAndUpdate(
          { _id: new mongoose.Types.ObjectId(new_data.dataset_id) },
          { status: "REVIEWED" },
          { new: true }
        );

        await this.markReviewedAndProcess({ dataset_id: new_data.dataset_id });
      }

      return {
        data: { metric, annotator_dataset },
        status: 200,
        message: "Review data",
      };
    } catch (err: any) {
      console.log(err);
      return { status: 500, message: err.message };
    }
  }

  async markReviewedAndProcess(body: any) {
    try {
      console.log(body);
      const annotators: any = await getDatasetAnnotators(body.dataset_id);
      const addresses: any = [];
      const multipliers: any = [];
      annotators.annotator_ids.forEach((annotator: any) => {
        addresses.push(annotator.wallet_address);
        multipliers.push(annotator.multiplier);
      });
      const dataset: any = await Dataset.findOne({
        _id: new mongoose.Types.ObjectId(body.dataset_id),
      });
      const data = await setShareHolders(
        dataset.contractId,
        addresses,
        multipliers
      );
      return { data, status: 200, message: "Get annotator data" };
    } catch (err: any) {
      console.log(err);
      return { status: 500, message: err.message };
    }
  }

  async distributeFunds(body: any) {
    try {
      const dataset: any = await Dataset.findOne({
        _id: new mongoose.Types.ObjectId(body.dataset_id),
      });
      const contractId = dataset.contractId;
      const data = await distributeFunds(contractId);

      return { data, status: 200, message: "Get annotator data" };
    } catch (err: any) {
      console.log(err);
      return { status: 500, message: err.message };
    }
  }

  async getContractDetails(params: any) {
    try {
      const contract: any = await getContractAddress(params.id as string);
      return {
        data: contract.contract.contractAddress,
        status: 200,
        message: "Get contract details",
      };
    } catch (err: any) {
      console.log(err);
      return { status: 500, message: err.message };
    }
  }
}

export default new DatasetController();
