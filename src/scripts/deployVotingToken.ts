import { parseUnits } from "@ethersproject/units";
import { Signer } from "ethers";
import { signers } from "src/addresses/signers";
import { MockERC20__factory } from "types/factories/MockERC20__factory";
import { MockERC20 } from "types/MockERC20";

export async function deployVotingToken(signer: Signer): Promise<MockERC20> {
  const tokenDeployer = new MockERC20__factory(signer);
  const tokenContract = await tokenDeployer.deploy(
    "Element Governance Token",
    "ELFI"
  );
  await Promise.all(
    signers.map((walletAddress) =>
      // seed balances
      tokenContract.setBalance(walletAddress, parseUnits("50", 18))
    )
  );

  return tokenContract;
}
