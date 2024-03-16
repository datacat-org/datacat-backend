import mongoose, { Document, Model, Schema } from "mongoose";

export interface IData extends Document {
  dataset_id: string;
  times_annotated: number;
  cid: string;
  status: string;
  is_labeled: boolean;
  label: number;
  createdAt: Date;
  updatedAt: Date;
}

export const DataSchema: Schema = new Schema({
  dataset_id: { type: String, required: true },
  times_annotated: { type: Number, default: 0 },
  cid: { type: String, required: true },
  status: { type: String, default: "PENDING" },
  is_labeled: { type: Boolean, default: false },
  label: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Data: Model<IData> =
  mongoose.models.data || mongoose.model<IData>("data", DataSchema);
