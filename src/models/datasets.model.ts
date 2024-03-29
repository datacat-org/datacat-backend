import mongoose, { Document, Model, Schema } from "mongoose";

export interface IDataset extends Document {
  name: string;
  description: string;
  type: string;
  times_annotated: number;
  nums_row: number;
  display_status: string;
  price: number;
  status: string;
  creator_id: string;
  createdAt: Date;
  updatedAt: Date;
  contractId: string;
}

export const DatasetSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  type: { type: String },
  times_annotated: { type: Number, default: 0 },
  nums_row: { type: Number, default: 0 },
  display_status: { type: String, default: "PUBLIC" },
  price: { type: Number, default: 0 },
  status: { type: String, default: "PENDING" },
  creator_id: { type: String, required: true },
  contractId: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Dataset: Model<IDataset> =
  mongoose.models.dataset || mongoose.model<IDataset>("dataset", DatasetSchema);
