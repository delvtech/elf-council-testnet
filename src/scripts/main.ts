import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers, Signer } from "ethers";
import { parseEther } from "ethers/lib/utils";
import fs from "fs";
import hre from "hardhat";
// This is imported so that it will install the plugin on the hre
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import ethernal from "hardhat-ethernal";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { AddressesJsonFile } from "src/addresses/AddressesJsonFile";
import {
  deployGovernanace,
  GovernanceContracts,
} from "src/scripts/deployGovernance";
import { MockERC20__factory, VestingVault__factory } from "types";

async function main() {
  const signers: SignerWithAddress[] = await hre.ethers.getSigners();
  const [signer] = signers;

  const governanceContracts = await deployGovernanace(hre, signer, signers);

  const accounts = signers.map((s) => s.address);
  const { elementToken, vestingVault } = governanceContracts;

  await giveAccountsVotingTokens(signer, accounts, elementToken);
  await allocateGrants(hre, elementToken, vestingVault, signers);

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

async function allocateGrants(
  hre: HardhatRuntimeEnvironment,
  grantTokenAddress: string,
  vestingVault: string,
  signers: SignerWithAddress[]
) {
  const tokenContract = MockERC20__factory.connect(
    grantTokenAddress,
    signers[0]
  );
  // signers[0] is the owner of the vesting vault
  const vestingVaultContract = VestingVault__factory.connect(
    vestingVault,
    signers[0]
  );

  // depsoit tokens to the vesting vault for allocating grants
  await (
    await tokenContract.setBalance(signers[0].address, parseEther("100"))
  ).wait(1);
  await (
    await tokenContract.setAllowance(
      signers[0].address,
      vestingVault,
      ethers.constants.MaxUint256
    )
  ).wait(1);
  await (await vestingVaultContract.deposit(parseEther("100"))).wait(1);

  // grant with cliff of 50 blocks and expiration of 100 blocks
  const provider = hre.ethers.getDefaultProvider();
  const blockNumber = await provider.getBlockNumber();
  await (
    await vestingVaultContract.addGrantAndDelegate(
      signers[2].address,
      parseEther("10"),
      blockNumber,
      blockNumber + 100,
      50,
      signers[2].address
    )
  ).wait(1);

  // fully vested grant
  await (
    await vestingVaultContract.addGrantAndDelegate(
      signers[3].address,
      parseEther("10"),
      blockNumber,
      blockNumber,
      0,
      signers[3].address
    )
  ).wait(1);

  console.log("grants given to signers[2] and signers[3]");
}
