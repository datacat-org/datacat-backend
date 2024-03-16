import mongoose, { Document, Model, Schema } from "mongoose";

export interface IConsumer extends Document {
  //worldcoin stuff - TO ADD
  wallet_address: string;
  createdAt: Date;
  updatedAt: Date;
}

export const ConsumerSchema: Schema = new Schema({
  //worldcoin stuff - TO ADD
  wallet_address: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Consumer: Model<IConsumer> =
  mongoose.models.consumer ||
  mongoose.model<IConsumer>("consumer", ConsumerSchema);
