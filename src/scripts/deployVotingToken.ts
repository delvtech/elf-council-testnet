import { Signer } from "ethers";
import { MockERC20__factory } from "types/factories/MockERC20__factory";
import { MockERC20 } from "types/MockERC20";

export async function deployVotingToken(signer: Signer): Promise<MockERC20> {
  const tokenDeployer = new MockERC20__factory(signer);
  const tokenContract = await tokenDeployer.deploy(
    "Element Governance Token",
    "ELFI"
  );

  return tokenContract;
}
