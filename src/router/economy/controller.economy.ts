import { Consumer } from "../../models/consumers.model";
import { Dataset } from "../../models/datasets.model";
import { getDatasetFinalLabels } from "../dataset/utils.dataset";

class EconomyController {
  async getDatasets(query: any) {
    try {
      const datasets = await Dataset.find({
        ...query,
        status: "REVIEWED",
        display_status: "PUBLIC",
      });
      return { data: datasets, status: 200, message: "Get all datasets" };
    } catch (err: any) {
      console.log(err);
      return { status: 500, message: err.message };
    }
  }

  async buyDataset(body: any) {
    try {
      const dataset = await Dataset.findById(body.dataset_id);
      if (!dataset) {
        return { status: 404, message: "Dataset not found" };
      }
      const response = await getDatasetFinalLabels(body.dataset_id);
      const final_data_list = response.data;

      return { data: final_data_list, status: 200, message: "Dataset bought" };
    } catch (err: any) {
      console.log(err);
      return { status: 500, message: err.message };
    }
  }

  async createConsumer(body: any) {
    try {
      const consumer = await Consumer.create(body);
      return { data: consumer, status: 200, message: "Create consumer" };
    } catch (err: any) {
      console.log(err);
      return { status: 500, message: err.message };
    }
  }
}

export default new EconomyController();
