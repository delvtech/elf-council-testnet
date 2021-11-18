import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { syncContractWithEthernal } from "src/ethernal/syncContractWithEthernal";
import { MockERC20__factory } from "types/factories/MockERC20__factory";
import { MockERC20 } from "types/MockERC20";

export async function deployVotingToken(
  hre: HardhatRuntimeEnvironment,
  signer: SignerWithAddress
): Promise<MockERC20> {
  const tokenDeployer = new MockERC20__factory(signer);
  const tokenContract = await tokenDeployer.deploy(
    "Element Governance Token",
    "ELFI",
    signer.address
  );
  await syncContractWithEthernal(hre, "MockERC20", tokenContract.address);

  return tokenContract;
}
