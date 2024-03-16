import mongoose, { Document, Model, Schema } from "mongoose";
import { IData } from "./data.model";

export interface IAnnotator extends Document {
  //worldcoin stuff - TO ADD
  nullifier_hash: string;
  wallet_address: string;
  data_assigned: IData["_id"][];
  createdAt: Date;
  updatedAt: Date;
}

export const AnnotatorSchema: Schema = new Schema({
  //worldcoin stuff - TO ADD
  nullifier_hash: { type: String, required: true },
  wallet_address: { type: String, required: true },
  data_assigned: [{ type: Schema.Types.ObjectId, ref: "data" }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Annotator: Model<IAnnotator> =
  mongoose.models.annotator ||
  mongoose.model<IAnnotator>("annotator", AnnotatorSchema);
