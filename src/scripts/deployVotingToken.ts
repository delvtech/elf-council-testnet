import { Signer } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { MockERC20__factory } from "types/factories/MockERC20__factory";
import { MockERC20 } from "types/MockERC20";

export async function deployVotingToken(
  hre: HardhatRuntimeEnvironment,
  signer: Signer
): Promise<MockERC20> {
  const tokenDeployer = new MockERC20__factory(signer);
  const tokenContract = await tokenDeployer.deploy(
    "Element Governance Token",
    "ELFI"
  );
  await hre.ethernal.push({
    name: "MockERC20",
    address: tokenContract.address,
  });

  return tokenContract;
}
