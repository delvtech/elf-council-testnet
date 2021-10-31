import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumberish, Signer } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { syncContractWithEthernal } from "src/ethernal/syncContractWithEthernal";
import { VestingVault__factory } from "types/factories/VestingVault__factory";
import { VestingVault } from "types/VestingVault";

export async function deployVestingVault(
  hre: HardhatRuntimeEnvironment,
  signer: SignerWithAddress,
  tokenAddress: string,
  timelockAddress: string,
  staleBlockLag: BigNumberish
): Promise<VestingVault> {
  const vestingVaultDeployer = new VestingVault__factory(signer);
  const vestingVaultContract = await vestingVaultDeployer.deploy(
    tokenAddress,
    staleBlockLag
  );
  console.log("deployed vesting vault");

  await syncContractWithEthernal(
    hre,
    "LockingVault",
    vestingVaultContract.address
  );

  await vestingVaultContract.initialize(signer.address, timelockAddress);

  return vestingVaultContract;
}
