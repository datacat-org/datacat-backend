import mongoose, { Document, Model, Schema } from "mongoose";

export interface IData extends Document {
  dataset_id: "string";
  times_annotated: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export const DataSchema: Schema = new Schema({
  dataset_id: { type: String, required: true },
  times_annotated: { type: Number, default: 0 },
  status: { type: String, default: "PENDING" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Data: Model<IData> =
  mongoose.models.data || mongoose.model<IData>("data", DataSchema);
