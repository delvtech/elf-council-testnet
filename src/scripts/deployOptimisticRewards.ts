import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import MerkleTree from "merkletreejs";
import { OptimisticRewards, OptimisticRewards__factory } from "types";

export async function deployOptimisticRewards(
  hre: HardhatRuntimeEnvironment,
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

  await hre.ethernal.push({
    name: "OptimisticRewards",
    address: rewardsContract.address,
  });

  return rewardsContract;
}
