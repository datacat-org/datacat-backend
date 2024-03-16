import mongoose, { Document, Model, Schema } from "mongoose";

export interface IDataset extends Document {
  name: string;
  description: string;
  type: string;
  times_annotated: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export const DatasetSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  type: { type: String },
  times_annotated: { type: Number, default: 0 },
  status: { type: String, default: "PENDING" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Dataset: Model<IDataset> =
  mongoose.models.dataset || mongoose.model<IDataset>("dataset", DatasetSchema);
