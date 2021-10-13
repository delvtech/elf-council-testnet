import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { parseEther } from "ethers/lib/utils";
import MerkleTree from "merkletreejs";
import {
  MockERC20__factory,
  OptimisticRewards,
  OptimisticRewards__factory,
} from "types";

export async function deployOptimisticRewards(
  signer: SignerWithAddress,
  elementTokenAddress: string,
  coreVotingAddress: string,
  merkleTree: MerkleTree,
  rewardTokenAddress: string,
  lockingVaultAddress: string
): Promise<OptimisticRewards> {
  const tokenContract = MockERC20__factory.connect(elementTokenAddress, signer);
  const rewardsDeployer = new OptimisticRewards__factory(signer);
  const rewardsContract = await rewardsDeployer.deploy(
    coreVotingAddress,
    merkleTree.getHexRoot(),
    signer.address,
    signer.address,
    rewardTokenAddress,
    lockingVaultAddress
  );
  const setBalanceTx = await tokenContract.setBalance(
    rewardTokenAddress,
    parseEther("10")
  );
  await setBalanceTx.wait(1);

  return rewardsContract;
}
