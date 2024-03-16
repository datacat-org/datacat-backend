import { AnnotatorDataset } from "../models/annotatorDataset.model";

export const payAnnotaters = async (dataset_id: string) => {
  try {
    const annotater_datasets = await AnnotatorDataset.find({
      dataset_id: dataset_id,
    }).populate("annotater_id");
    return {
      data: annotater_datasets,
      status: 200,
      message: "Get all annotaters for dataset",
    };
  } catch (err: any) {
    console.log(err);
    return { status: 500, message: err.message };
  }
};
