import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const entitySecretCipherText = process.env.CIRCLE_ENTITY_SECRET;
const walletSetId = process.env.CIRCLE_WALLET_SET_ID;

export const createUserWallet = () => {
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

  axios
    .request(options)
    .then(function (response) {
      console.log(response.data);
      return response.data;
    })
    .catch(function (error) {
      console.error(error);
    });
};


