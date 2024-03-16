import lighthouse from "@lighthouse-web3/sdk";
import fs from "fs";
import axios from "axios";

const { LIGHTHOUSE_API_KEY } = process.env;

export const uploadFileToLighthouse = async (buffer: any) => {
  const uploadResponse = await lighthouse.uploadBuffer(
    buffer,
    LIGHTHOUSE_API_KEY as string
  );
  return uploadResponse;
};

export const retrieveFileFromLighthouse = async (
  cid: string,
  download_path: string
) => {
  axios
    .get(`https://gateway.lighthouse.storage/ipfs/${cid}`, {
      responseType: "arraybuffer",
    })
    .then((response) => {
      const buffer = Buffer.from(response.data, "binary");
      fs.writeFile(download_path, buffer, (err) => {
        if (err) throw err;
        console.log(`File saved to ${download_path}`);
      });
    })
    .catch((error) => {
      console.error("Failed to save the file:", error);
    });
};
