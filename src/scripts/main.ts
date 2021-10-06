import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import hre from "hardhat";
import { deployGovernanace } from "src/scripts/deployGovernance";

async function main() {
  const signers: SignerWithAddress[] = await hre.ethers.getSigners();
  const [signer] = signers;

  await deployGovernanace(signer, signers);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
