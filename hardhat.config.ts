import { task } from "hardhat/config";

import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";
dotenvConfig({ path: resolve(__dirname, "./.env") });

import { HardhatUserConfig } from "hardhat/types";
import { NetworkUserConfig } from "hardhat/types";

import {ProxyAgent,setGlobalDispatcher } from 'undici'

import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";

import "hardhat-gas-reporter";
import "@nomiclabs/hardhat-etherscan";

const chainIds = {
  ganache: 1337,
  goerli: 5,
  hardhat: 31337,
  kovan: 42,
  mainnet: 1,
  rinkeby: 4,
  ropsten: 3,
  ftm:250,
  astar:592,
  matic:137,
};

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const INFURA_API_KEY = process.env.INFURA_API_KEY || "";
const ALCHEMY_KEY = process.env.ALCHEMY_KEY || "";

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await hre.ethers.getSigners();

  console.log(`account ${accounts}`)

  for (const account of accounts) {
    console.log(await account.getAddress());
  }
});

function createTestnetConfig(network: keyof typeof chainIds): NetworkUserConfig {
  const url: string = "https://rpc.ankr.com/eth_goerli"
  return {
    accounts: [PRIVATE_KEY],
    chainId: chainIds[network],
    url,
  };
}


function createFTMConfig(network: keyof typeof chainIds): NetworkUserConfig {
  const url: string = "https://rpc.ftm.tools/";
  return {
    accounts: [PRIVATE_KEY],
    chainId: chainIds[network],
    url,
  };
}

function createMaticConfig(network: keyof typeof chainIds): NetworkUserConfig {
  const url: string = "https://rpc-mainnet.matic.quiknode.pro";
  return {
    accounts: [PRIVATE_KEY],
    chainId: chainIds[network],
    url,
  };
}


function createAstarConfig(network: keyof typeof chainIds): NetworkUserConfig {
  const url: string = "https://rpc.astar.network:8545";
  return {
    accounts: [PRIVATE_KEY],
    chainId: chainIds[network],
    url,
  };
}
// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    mainnet: createTestnetConfig("mainnet"),
    goerli: createTestnetConfig("goerli"),
    kovan: createTestnetConfig("kovan"),
    rinkeby: createTestnetConfig("rinkeby"),
    ropsten: createTestnetConfig("ropsten"),
    ftm: createFTMConfig("ftm"),
    astar:createAstarConfig("astar"),
    matic:createMaticConfig("matic"),
    

  },
  solidity: {
    compilers: [
      {
        version: "0.8.4",
      },
    ],
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },

  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
};


export default config;
