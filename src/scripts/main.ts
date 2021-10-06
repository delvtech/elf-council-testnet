import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import fs from "fs";
import hre from "hardhat";
import { AddressesJsonFile } from "src/addresses/AddressesJsonFile";
import {
  deployGovernanace,
  GovernanceContracts,
} from "src/scripts/deployGovernance";

async function main() {
  const signers: SignerWithAddress[] = await hre.ethers.getSigners();
  const [signer] = signers;

  const governanceContracts = await deployGovernanace(signer, signers);

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
