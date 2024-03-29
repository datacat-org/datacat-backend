import { AnnotatorDataset } from "../../models/annotatorDataset.model";
import { Annotator } from "../../models/annotators.model";
import {
  createUserWallet,
  getWalletBalances,
  approveWallet,
  staking,
  unstaking,
} from "../../handlers/circle.handler";

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
      //check if nullifier hash already exists
      const user = await Annotator.findOne({
        nullifier_hash: body.nullifier_hash,
      });
      if (user) {
        return { status: 400, message: "User already exists" };
      }
      //circle ci stuff
      const userWalletCreated = await createUserWallet();
      const circleWalletAddress = userWalletCreated[0].address;
      const circleWalletId = userWalletCreated[0].id;
      const annotator = await Annotator.create({
        ...body,
        circle_wallet_address: circleWalletAddress,
        circle_wallet_id: circleWalletId,
      });

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
  async getUserByWalletAddress(params: any) {
    try {
      const annotator = await Annotator.findOne({
        wallet_address: params.address,
      });
      return {
        data: annotator,
        status: 200,
        message: "Get user by wallet address",
      };
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
      })
        .populate("dataset_id")
        .exec();
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

  async getUserWalletBalance(params: any) {
    try {
      const user_id = params.id;
      const user = await Annotator.findById(user_id);
      if (!user) {
        throw new Error("User not found");
      }
      const wallet_id = user.circle_wallet_id;
      const walletBalances = await getWalletBalances(wallet_id);
      return {
        data: walletBalances,
        status: 200,
        message: "Get wallet balances for user",
      };
    } catch (err: any) {
      console.log(err);
      return { status: 500, message: err.message };
    }
  }
  async getUserData(params: any) {
    try {
      const annotator = await Annotator.findById(params.user_id);
      const annotator_datasets = await AnnotatorDataset.find({
        annotator_id: params.user_id,
        dataset_id: params.dataset_id,
      });
      return {
        data: { annotator, annotator_datasets },
        status: 200,
        message: "Get user data",
      };
    } catch (err: any) {
      console.log(err);
      return { status: 500, message: err.message };
    }
  }

  async approveUser(body: any) {
    try {
      const annotaor_id = body.annotator_id;
      const annotator: any = await Annotator.findById(annotaor_id);
      const approval_data = await approveWallet(annotator.circle_wallet_id);
      return {
        data: approval_data,
        status: 200,
        message: "Approve user",
      };
    } catch (err: any) {
      console.log(err);
      return { status: 500, message: err.message };
    }
  }

  async stake(body: any) {
    try {
      const annotator_id = body.annotator_id;
      const annotator: any = await Annotator.findById(annotator_id);
      const approval_data = await staking(
        annotator.circle_wallet_id,
        body.amount
      );
      return {
        data: approval_data,
        status: 200,
        message: "Staking",
      };
    } catch (err: any) {
      console.log(err);
      return { status: 500, message: err.message };
    }
  }

  async unstake(body: any) {
    try {
      const annotator_id = body.annotator_id;
      const annotator: any = await Annotator.findById(annotator_id);
      const approval_data = await unstaking(
        annotator.circle_wallet_id,
        body.amount
      );
      return {
        data: approval_data,
        status: 200,
        message: "Unstaking",
      };
    } catch (err: any) {
      console.log(err);
      return { status: 500, message: err.message };
    }
  }
}

export default new UserController();
