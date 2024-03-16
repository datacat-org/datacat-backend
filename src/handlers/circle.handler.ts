import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const entitySecretCipherText = process.env.CIRCLE_ENTITY_SECRET;
const walletSetId = process.env.CIRCLE_WALLET_SET_ID;
const usdcTokenID = "7adb2b7d-c9cd-5164-b2d4-b73b088274dc";

export const createUserWallet = async () => {
  const options = {
    method: 'POST',
    url: 'https://api.circle.com/v1/w3s/developer/wallets',
    headers: {'Content-Type': 'application/json', Authorization: 'Bearer <YOUR_API_KEY>'},
    data: {
      idempotencyKey: uuidv4(),
      entitySecretCipherText: entitySecretCipherText,
      blockchains: ['MATIC-MUMBAI', 'ETH-GOERLI', 'MATIC'],
      count: 1,
      walletSetId: walletSetId
    }
  };

  try {
    const response = await axios.request(options);
    if (response.status === 200) {
      console.log(response.data);
      const d = await response.data;
      return d;
    }
  } catch (error) {
    console.error(error);
    return error;
  }
};



export const getWalletBalances = async (walletId: string) => {
  const options = {
    method: 'GET',
    url: `https://api.circle.com/v1/w3s/wallets/${walletId}/balances`,
    headers: {'Content-Type': 'application/json', Authorization: 'Bearer <YOUR_API_KEY>'}
  };

  try {
    const response = await axios.request(options);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error);
    return error;
  }
};


export const transferTokens = async (
  amount: string,
  destinationAddress: string,
  walletId: string
) => {
  const options = {
    method: 'POST',
    url: 'https://api.circle.com/v1/w3s/developer/transactions/transfer',
    headers: {'Content-Type': 'application/json', Authorization: 'Bearer <YOUR_API_KEY>'},
    data: {
      idempotencyKey: uuidv4(),
      entitySecretCipherText: entitySecretCipherText,
      amounts: [amount],
      destinationAddress: destinationAddress,
      feeLevel: 'HIGH',
      tokenId: usdcTokenID,
      walletId: walletId
    }
  };

  try {
    const response = await axios.request(options);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error);
    return error;
  }
};
