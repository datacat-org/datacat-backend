import { AnnotatorDataset } from "../../models/annotatorDataset.model";
import { Annotator } from "../../models/annotators.model";
import { createUserWallet } from "handlers/circle.handler";

class UserController {
  async getUsers(query: any) {
    try {
      const annotators = await Annotator.find(query).select("-data_assigned");
      return { data: annotators, status: 200, message: "Get all users" };
    } catch (err: any) {
      console.log(err);
      return { status: 500, message: err.message };
    }
  }
  async createUser(body: any) {
    try {
      const userWalletCreated = await createUserWallet();
      const circleWalletAddress = userWalletCreated.data.wallets[0].address;
      const circleWalletId = userWalletCreated.data.wallets[0].id;
      const annotator = await Annotator.create({...body, circle_wallet_address: circleWalletAddress, circle_wallet_set_id: circleWalletId});
      return { data: annotator, status: 200, message: "Create user" };
    } catch (err: any) {
      console.log(err);
      return { status: 500, message: err.message };
    }
  }
  async getUserById(params: any) {
    try {
      const annotator = await Annotator.findById(params.id);
      return { data: annotator, status: 200, message: "Get user by id" };
    } catch (err: any) {
      console.log(err);
      return { status: 500, message: err.message };
    }
  }
  async updateUser(params: any, body: any) {
    try {
      const annotator = await Annotator.findByIdAndUpdate(params.id, body, {
        new: true,
      });
      return { data: annotator, status: 200, message: "Update user by id" };
    } catch (err: any) {
      console.log(err);
      return { status: 500, message: err.message };
    }
  }
  async deleteUser(params: any) {
    try {
      await Annotator.findByIdAndDelete(params.id);
      return { status: 200, message: "Delete user by id" };
    } catch (err: any) {
      console.log(err);
      return { status: 500, message: err.message };
    }
  }
  async getDatasets(params: any) {
    try {
      const user_id = params.id;
      const annotator_datasets = await AnnotatorDataset.find({
        annotator_id: user_id,
      }).populate("dataset_id");
      return {
        data: annotator_datasets,
        status: 200,
        message: "Get all datasets for user",
      };
    } catch (err: any) {
      console.log(err);
      return { status: 500, message: err.message };
    }
  }
  async getData(params: any) {
    try {
      const user_id = params.id;
      const dataset_id = params.dataset_id;
      const data = await Annotator.findById(user_id).populate({
        path: "data_assigned",
        match: { dataset_id: dataset_id },
      });
      return {
        data,
        status: 200,
        message: "Get all data for the user for a particular dataset",
      };
    } catch (err: any) {
      console.log(err);
      return { status: 500, message: err.message };
    }
  }
}

export default new UserController();
