import { BigNumberish, Signer } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Timelock__factory } from "types/factories/Timelock__factory";
import { Timelock } from "types/Timelock";

export async function deployTimelock(
  hre: HardhatRuntimeEnvironment,
  signer: Signer,
  waitTime: BigNumberish,
  governanceAddress: string,
  gscVaultAddress: string
): Promise<Timelock> {
  const timeLockDeployer = new Timelock__factory(signer);
  const timeLockContract = await timeLockDeployer.deploy(
    waitTime,
    governanceAddress,
    gscVaultAddress
  );

  await hre.ethernal.push({
    name: "Timelock",
    address: timeLockContract.address,
  });

  return timeLockContract;
}
