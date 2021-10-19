import { BigNumberish, Signer } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { LockingVault__factory } from "types/factories/LockingVault__factory";
import { SimpleProxy__factory } from "types/factories/SimpleProxy__factory";
import { SimpleProxy } from "types/SimpleProxy";

export async function deployLockingVault(
  hre: HardhatRuntimeEnvironment,
  signer: Signer,
  tokenAddress: string,
  timeLockAddress: string,
  staleBlockLag: BigNumberish
): Promise<SimpleProxy> {
  const lockingVaultDeployer = new LockingVault__factory(signer);
  const lockingVaultBaseContract = await lockingVaultDeployer.deploy(
    tokenAddress,
    staleBlockLag
  );
  console.log("deployed locking vault base");

  // QUESTION do I need to use a wallet here?
  // const { provider } = waffle;
  // const [wallet] = provider.getWallets();
  const proxyDeployer = new SimpleProxy__factory(signer);
  console.log("deployed proxy vault");
  const lockingVaultProxy = await proxyDeployer.deploy(
    timeLockAddress,
    lockingVaultBaseContract.address
  );

  console.log("deployed locking vault proxy");
  const lockingVaultContract = lockingVaultProxy.attach(
    lockingVaultProxy.address
  );

  console.log("deployed locking vault");

  await hre.ethernal.push({
    name: "LockingVault",
    address: lockingVaultContract.address,
  });

  return lockingVaultContract;
}
