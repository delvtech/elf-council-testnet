import { BigNumberish, Signer } from "ethers";
import { LockingVault__factory } from "types/factories/LockingVault__factory";
import { LockingVault } from "types/LockingVault";

export async function deployLockingVault(
  signer: Signer,
  tokenAddress: string,
  staleBlockLag: BigNumberish
): Promise<LockingVault> {
  const lockingVaultDeployer = new LockingVault__factory(signer);
  const lockingVaultContract = await lockingVaultDeployer.deploy(
    tokenAddress,
    staleBlockLag
  );

  return lockingVaultContract;
}
