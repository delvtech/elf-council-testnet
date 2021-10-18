import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import MerkleTree from "merkletreejs";
import { OptimisticRewards, OptimisticRewards__factory } from "types";

export async function deployOptimisticRewards(
  signer: SignerWithAddress,
  elementTokenAddress: string,
  coreVotingAddress: string,
  merkleTree: MerkleTree,
  lockingVaultAddress: string
): Promise<OptimisticRewards> {
  const rewardsDeployer = new OptimisticRewards__factory(signer);
  const rewardsContract = await rewardsDeployer.deploy(
    coreVotingAddress,
    merkleTree.getHexRoot(),
    signer.address,
    signer.address,
    elementTokenAddress,
    lockingVaultAddress
  );

  return rewardsContract;
}
