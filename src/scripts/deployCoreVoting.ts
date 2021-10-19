import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumberish } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { CoreVoting } from "types/CoreVoting";
import { CoreVoting__factory } from "types/factories/CoreVoting__factory";

export async function deployCoreVoting(
  hre: HardhatRuntimeEnvironment,
  signer: SignerWithAddress,
  votingVaultAddresses: string[],
  timeLockAddress: string,
  baseQuorum: BigNumberish,
  minProposalPower: BigNumberish,
  gscVaultAddress: string
): Promise<CoreVoting> {
  const coreVotingDeployer = new CoreVoting__factory(signer);
  const coreVotingContract = await coreVotingDeployer.deploy(
    timeLockAddress,
    baseQuorum,
    minProposalPower,
    gscVaultAddress,
    votingVaultAddresses
  );

  await hre.ethernal.push({
    name: "CoreVoting",
    address: coreVotingContract.address,
  });

  return coreVotingContract;
}
