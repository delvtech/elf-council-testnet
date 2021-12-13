// This adds ethers to the hre which has dev utilities for local testnet like 'getSigners()'
import "@nomiclabs/hardhat-waffle";
// Typechain support for hardhat
import "@typechain/hardhat";
// Ethernal plugin - a blockchain / contract explorer for private testnets
import "hardhat-ethernal";
// This adds support for typescript paths mappings
import "tsconfig-paths/register";

import { getTokenList } from "elf-council-tokenlist";
import fs from "fs";
import { extendEnvironment, HardhatUserConfig, task } from "hardhat/config";

const syncEthernal = Boolean(process.env.SYNC_ETHERNAL);
extendEnvironment((hre) => {
  hre.ethernalSync = syncEthernal;
  hre.ethernalWorkspace = "Hardhat Network";
  // paid feature, disable for now
  hre.ethernalTrace = false;
});

task(
  "build-tokenlist",
  "Builds a council tokenlist for a single chain"
).setAction(async (unusedTaskArgs, hre) => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const addressesJson = require("src/addresses/testnet.addresses.json");
  const { provider } = hre.ethers;

  const tokenList = await getTokenList(
    provider,
    addressesJson,
    `Council testnet token list`
  );

  const tokenListString = JSON.stringify(tokenList, null, 2);
  console.log(tokenListString);

  // TODO: We have to validate this json schema ourselves before it can be
  // published to the uniswap directory.  For now, just look at this file in
  // vscode and make sure there are no squiggles.
  fs.writeFileSync("src/tokenlist/testnet.tokenlist.json", tokenListString);
});

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  paths: {
    sources: "src",
  },
  solidity: {
    compilers: [
      {
        version: "0.7.1",
        settings: {
          optimizer: {
            enabled: true,
            runs: 10000,
          },
        },
      },
      {
        version: "0.8.3",
        settings: {
          optimizer: {
            enabled: true,
            runs: 7500,
          },
        },
      },
    ],
  },
  typechain: {
    outDir: "types",
    target: "ethers-v5",
  },
  mocha: { timeout: 0 },
  networks: {
    hardhat: {
      forking: {
        url: "https://eth-mainnet.alchemyapi.io/v2/kwjMP-X-Vajdk1ItCfU-56Uaq1wwhamK",
        blockNumber: 11853372,
      },
      accounts: {
        accountsBalance: "100000000000000000000000", // 100000 ETH
        count: 5,
      },
    },
    mainnet: {
      url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_MAINNET_API_KEY}`,
    },
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${process.env.ALCHEMY_GOERLI_API_KEY}`,
    },
  },
};

export default config;
