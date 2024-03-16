import { Annotator } from "../models/annotators.model";
// import { AnnotatorDataset } from "../models/annotatorDataset.model";
import { Data } from "../models/data.model";

/*
selct num_workers random annotators
get all the data for the dataset
make 10 copies of all the data
assign it to the selected annotators 
make sure no annotator gets the same data entry more than once
*/

export const distributeWork = async (dataset_id: string) => {
  const annotators = await Annotator.find({}).select("_id");
  const data = await Data.find({ dataset_id: dataset_id }).select("_id");
  const num_annotators = annotators.length;
  const splits = data.map(async (d) => {
    //select num_workers random indices from annotators
    const selected_annotators = [];

    const index = Math.floor(Math.random() * num_annotators);
    selected_annotators.push(annotators[index]);

    return Promise.all(
      selected_annotators.map((annotator) => {
        console.log(annotator, d);
        return Annotator.updateOne(
          { _id: annotator._id },
          { $push: { data_assigned: d._id } }
        );
      })
    );
  });
  const resolved_splits = await Promise.all(splits);
  await Promise.all(resolved_splits);
  console.log(resolved_splits);
  return { status: 200, message: "Work distributed" };
};
