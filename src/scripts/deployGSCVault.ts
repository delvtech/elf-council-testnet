import { BigNumberish, Signer } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { GSCVault__factory } from "types/factories/GSCVault__factory";
import { GSCVault } from "types/GSCVault";

export async function deployGSCVault(
  hre: HardhatRuntimeEnvironment,
  signer: Signer,
  coreVotingAddress: string,
  votingPowerBound: BigNumberish,
  governanceOwnerAddress: string
): Promise<GSCVault> {
  const GSCDeployer = new GSCVault__factory(signer);
  const GSCContract = await GSCDeployer.deploy(
    coreVotingAddress,
    votingPowerBound,
    governanceOwnerAddress
  );
  await hre.ethernal.push({
    name: "GSCVault",
    address: GSCContract.address,
  });

  return GSCContract;
}
