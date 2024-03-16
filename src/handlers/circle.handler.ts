import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import forge from "node-forge";

const entitySecretCipherText = process.env.CIRCLE_ENTITY_SECRET as string;
const walletSetId = process.env.CIRCLE_WALLET_SET_ID;
const usdcTokenID = "7adb2b7d-c9cd-5164-b2d4-b73b088274dc";

export const createEntitySecretKey = async () => {
  const url = "https://api.circle.com/v1/w3s/config/entity/publicKey";
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.CIRCLE_API_KEY}`,
  };

  const public_key = await axios.get(url, { headers });
  const entitySecret = forge.util.hexToBytes(entitySecretCipherText);
  const publicKey = forge.pki.publicKeyFromPem(public_key.data.data.publicKey);
  const encryptedData = publicKey.encrypt(entitySecret, "RSA-OAEP", {
    md: forge.md.sha256.create(),
    mgf1: {
      md: forge.md.sha256.create(),
    },
  });
  return forge.util.encode64(encryptedData);
};

export const createUserWallet = async () => {
  const entity_cipher_text = await createEntitySecretKey();

  const url = "https://api.circle.com/v1/w3s/developer/wallets";
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.CIRCLE_API_KEY}`,
  };
  const data = {
    idempotencyKey: uuidv4(),
    entitySecretCipherText: entity_cipher_text,
    blockchains: ["MATIC-MUMBAI"],
    count: 1,
    walletSetId: walletSetId,
  };

  try {
    const response = await axios.post(url, data, { headers });
    if (response.status === 201) {
      const wallets = await response.data.data.wallets;
      return wallets;
    }
  } catch (error) {
    console.error(error);
    return error;
  }
};

export const getWalletBalances = async (walletId: string) => {
  const options = {
    method: "GET",
    url: `https://api.circle.com/v1/w3s/wallets/${walletId}/balances`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.CIRCLE_API_KEY}`,
    },
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
    method: "POST",
    url: "https://api.circle.com/v1/w3s/developer/transactions/transfer",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.CIRCLE_API_KEY}`,
    },
    data: {
      idempotencyKey: uuidv4(),
      entitySecretCipherText: entitySecretCipherText,
      amounts: [amount],
      destinationAddress: destinationAddress,
      feeLevel: "HIGH",
      tokenId: usdcTokenID,
      walletId: walletId,
    },
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
