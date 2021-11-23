import hre from "hardhat";
import { LockingVault__factory } from "types";

import { LockingVaultInfo } from "./types";

export const { provider } = hre.ethers;
export async function getLockingVaultInfo(
  chainId: number,
  tokenAddress: string,
  name: string
): Promise<LockingVaultInfo> {
  const lockingVaultContract = LockingVault__factory.connect(
    tokenAddress,
    provider
  );

  const tokenPromise = lockingVaultContract.token();
  const staleBlockLagPromise = lockingVaultContract.staleBlockLag();

  const [token, staleBlockLag] = await Promise.all([
    tokenPromise,
    staleBlockLagPromise,
  ]);

  return {
    chainId,
    address: tokenAddress,
    name,
    decimals: 0,
    symbol: "",
    extensions: {
      token,
      staleBlockLag: staleBlockLag.toNumber(),
    },
  };
}
