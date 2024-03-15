import mongoose, { ConnectOptions, Connection } from "mongoose";

const { MONGO_URI } = process.env;

mongoose.connect(
  MONGO_URI as string,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as ConnectOptions
);

const mongodbInstance: Connection = mongoose.connection;

export default mongodbInstance;
