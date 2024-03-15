import mongoose, { Document, Model, Schema } from "mongoose";
import { IDataset } from "./datasets.model";

export interface IData extends Document {
  dataset_id: IDataset["_id"];
  times_annotated: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export const DataSchema: Schema = new Schema({
  dataset_id: { type: Schema.Types.ObjectId, ref: "dataset", required: true },
  times_annotated: { type: Number, default: 0 },
  status: { type: String, default: "PENDING" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Data: Model<IData> =
  mongoose.models.data || mongoose.model<IData>("data", DataSchema);
