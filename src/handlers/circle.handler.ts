import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import forge from "node-forge";
import { abi, byteCode } from "../abi/transfer.abi.json";

const entitySecretCipherText = process.env.CIRCLE_ENTITY_SECRET as string;
const walletSetId = process.env.CIRCLE_WALLET_SET_ID;
const usdcTokenID = "0xe6b8a5CF854791412c1f6EFC7CAf629f5Df1c747";
const contractAbi = abi;

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

export const getContractAddress = async (contractId: string) => {
  const url = `https://api.circle.com/v1/w3s/contracts/${contractId}`;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.CIRCLE_API_KEY}`,
  };
  try {
    const response = await axios.get(url, { headers });
    return response.data.data;
  } catch (error) {
    console.error(error);
    return error;
  }
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
  const url = `https://api.circle.com/v1/w3s/wallets/${walletId}/balances`;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.CIRCLE_API_KEY}`,
  };

  try {
    const response = await axios.get(url, { headers });
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

export const deployCircleContract = async (
  name: string,
  description: string
) => {
  const entitySecretCipherText: any = await createEntitySecretKey();

  const url = "https://api.circle.com/v1/w3s/contracts/deploy";
  const headers = {
    "Content-Type": "application/json",
    accept: "application/json",
    Authorization: `Bearer ${process.env.CIRCLE_API_KEY}`,
  };
  console.log(description);
  const data: any = {
    idempotencyKey: uuidv4(),
    name: name,
    description: description || "No description",
    walletId: process.env.ADMIN_CIRCLE_WALLET_ID, //replace with platform wallet ID,
    blockchain: "MATIC-MUMBAI",
    feeLevel: "HIGH",
    constructorSignature: "constructor(address initialOwner)",
    constructorParameters: [usdcTokenID],
    entitySecretCiphertext: entitySecretCipherText,
    abiJSON: JSON.stringify(contractAbi),
    bytecode: byteCode,
  };
  try {
    const response = await axios.post(url, data, { headers });
    console.log("bam con");
    console.log(response.data);
    return response.data.data;
  } catch (error) {
    console.error(error);
    return error;
  }
};

export const setShareHolders = async (
  contract_id: string,
  walletAddresses: any,
  shareAmounts: any
) => {
  const entitySecretCipherText: any = await createEntitySecretKey();
  const contract_address = await getContractAddress(contract_id);
  const contractAddress = contract_address.contract.contractAddress;
  const url =
    "https://api.circle.com/v1/w3s/developer/transactions/contractExecution";
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.CIRCLE_API_KEY}`,
    accept: "application/json",
  };
  const data = {
    idempotencyKey: uuidv4(),
    walletId: process.env.ADMIN_CIRCLE_WALLET_ID,
    contractAddress: contractAddress,
    abiFunctionSignature:
      "setShares(address[] memory _payees,uint256[] memory _shares)",
    abiParameters: [walletAddresses, shareAmounts],
    feeLevel: "MEDIUM",
    entitySecretCipherText,
  };
  try {
    const response = await axios.post(url, data, { headers });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.log("bam-error");
    console.error(error);
    return error;
  }
};
