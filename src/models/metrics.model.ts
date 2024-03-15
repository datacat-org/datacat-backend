import mongoose, { Document, Model, Schema } from "mongoose";
import { IData } from "./data.model";
import { IAnnotator } from "./annotators.model";

export interface IMetric extends Document {
  //worldcoin stuff - TO ADD
  grade: number;
  annotaor_id: IAnnotator["_id"];
  data_id: IData["_id"];
  createdAt: Date;
  updatedAt: Date;
}

export const MetricSchema: Schema = new Schema({
  grade: { type: Number, required: true },
  annotaor_id: {
    type: Schema.Types.ObjectId,
    ref: "annotator",
    required: true,
  },
  data_id: { type: Schema.Types.ObjectId, ref: "data", required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Metric: Model<IMetric> =
  mongoose.models.metric || mongoose.model<IMetric>("metric", MetricSchema);
