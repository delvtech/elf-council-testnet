import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Signer } from "ethers";
import { parseEther } from "ethers/lib/utils";
import fs from "fs";
import hre from "hardhat";
// This is imported so that it will install the plugin on the hre
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import ethernal from "hardhat-ethernal";
import { AddressesJsonFile } from "src/addresses/AddressesJsonFile";
import {
  deployGovernanace,
  GovernanceContracts,
} from "src/scripts/deployGovernance";
import { MockERC20__factory } from "types";

async function main() {
  const signers: SignerWithAddress[] = await hre.ethers.getSigners();
  const [signer] = signers;

  const governanceContracts = await deployGovernanace(hre, signer, signers);

  const accounts = signers.map((s) => s.address);
  const { elementToken } = governanceContracts;

  await giveAccountsVotingTokens(signer, accounts, elementToken);
  console.log("accounts given voting tokens");

  writeAddressesJson(governanceContracts);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

function writeAddressesJson(governanceContracts: GovernanceContracts) {
  // Produce a schema-compliant testnet.addresses.json file
  const addressesJson: AddressesJsonFile = {
    chainId: 31337,
    addresses: governanceContracts,
  };
  const schemaAddresses = JSON.stringify(addressesJson, null, 2);

  console.log("testnet.addresses.json", schemaAddresses);
  fs.writeFileSync("./src/addresses/addresses.json", schemaAddresses);
}

async function giveAccountsVotingTokens(
  tokenOwner: Signer,
  accounts: string[],
  votingTokenAddress: string
) {
  const tokenContract = MockERC20__factory.connect(
    votingTokenAddress,
    tokenOwner
  );
  await Promise.all(
    accounts.map((address) =>
      // seed balances
      tokenContract.setBalance(address, parseEther("50"))
    )
  );
}
