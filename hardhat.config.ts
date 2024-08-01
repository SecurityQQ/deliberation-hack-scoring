import { HardhatUserConfig } from "hardhat/types";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.0",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_KEY}`,
      accounts: process.env.PRIVATE_KEY ? [`0x${process.env.PRIVATE_KEY}`] : [],
    },
  },
};

export default config;
