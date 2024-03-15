import mongoose, { Document, Model, Schema } from "mongoose";
import { IDataset } from "./datasets.model";
import { IAnnotator } from "./annotators.model";

export interface IAnnotatorDataset extends Document {
  //worldcoin stuff - TO ADD
  annotator_id: IAnnotator["_id"];
  dataset_id: IDataset["_id"];
  multiplier: number;
  createdAt: Date;
  updatedAt: Date;
}

export const AnnotatorDatasetSchema: Schema = new Schema({
  //worldcoin stuff - TO ADD
  annotator_id: {
    type: Schema.Types.ObjectId,
    ref: "annotator",
    required: true,
  },
  dataset_id: { type: Schema.Types.ObjectId, ref: "dataset", required: true },
  multiplier: { type: Number, default: 100 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const AnnotatorDataset: Model<IAnnotatorDataset> =
  mongoose.models.annotatordataset ||
  mongoose.model<IAnnotatorDataset>("annotatordataset", AnnotatorDatasetSchema);
