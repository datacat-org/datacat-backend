import { Metric } from "../../models/metrics.model";
import { Dataset } from "../../models/datasets.model";
import { AnnotatorDataset } from "../../models/annotatorDataset.model";
// import { Annotator } from "models/annotators.model";
// import { Data } from "../../models/data.model";
// import mongoose from "mongoose";

export const getDatasetFinalLabels = async (datasetId: string) => {
  try {
    const dataset = await Dataset.findById(datasetId);
    if (!dataset) {
      return { status: 404, message: "Dataset not found" };
    }
    const labels = await Metric.find({}).populate({
      path: "data_id",
      match: { dataset_id: datasetId },
    });

    const final_data_list: Array<Record<string, any>> = labels.map(
      (label_data: any) => {
        let final_data: Record<string, any> = {
          data_url: `https://gateway.lighthouse.storage/ipfs/${label_data.data_id.cid}`,
          times_labeled: label_data.data_id.times_annotated,
          label: label_data.grade,
        };
        if (label_data.data_id.is_labeled) {
          final_data["label"] = label_data.data_id.label;
        }
        return final_data;
      }
    );
    return { data: final_data_list, status: 200, message: "Dataset bought" };
  } catch (err: any) {
    console.log(err);
    return { status: 500, message: err.message };
  }
};

export const getDatasetAnnotators = async (datasetId: string) => {
  try {
    const data = await AnnotatorDataset.find({
      dataset_id: datasetId,
    }).populate([{ path: "annotator_id" }]);

    const annotator_ids = data.map((annotator: any) => {
      return {
        wallet_address: annotator.annotator_id.circle_wallet_address,
        multiplier: annotator.multiplier,
      };
    });

    return {
      annotator_ids,
      status: 200,
      message: "Get all annotators for dataset",
    };
  } catch (err: any) {
    console.log(err);
    return { status: 500, message: err.message };
  }
};
