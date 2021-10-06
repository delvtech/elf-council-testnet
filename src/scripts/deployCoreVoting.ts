import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumberish } from "ethers";
import { CoreVoting } from "types/CoreVoting";
import { CoreVoting__factory } from "types/factories/CoreVoting__factory";

export async function deployCoreVoting(
  signer: SignerWithAddress,
  votingVaultAddresses: string[],
  timeLockAddress: string,
  baseQuorum: BigNumberish,
  minProposalPower: BigNumberish,
  gscVaultAddress: string
): Promise<CoreVoting> {
  const coreVotingDeployer = new CoreVoting__factory(signer);
  const lockingVaultContract = await coreVotingDeployer.deploy(
    timeLockAddress,
    baseQuorum,
    minProposalPower,
    gscVaultAddress,
    votingVaultAddresses
  );

  return lockingVaultContract;
}
