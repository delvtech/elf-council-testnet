import hre from "hardhat";
import { Airdrop__factory } from "types";

import { AirdropContractInfo } from "./types";

export const { provider } = hre.ethers;
export async function getAirdropInfo(
  chainId: number,
  tokenAddress: string,
  name: string
): Promise<AirdropContractInfo> {
  const airdropContract = Airdrop__factory.connect(tokenAddress, provider);

  const rewardsRootPromise = airdropContract.rewardsRoot();
  const lockingVaultPromise = airdropContract.lockingVault();
  const expirationPromise = airdropContract.expiration();
  const tokenPromise = airdropContract.token();

  const [rewardsRoot, lockingVault, expiration, token] = await Promise.all([
    rewardsRootPromise,
    lockingVaultPromise,
    expirationPromise,
    tokenPromise,
  ]);

  return {
    chainId,
    address: tokenAddress,
    name,
    decimals: 0,
    symbol: "",
    extensions: {
      rewardsRoot,
      lockingVault,
      expiration: expiration.toString(),
      token,
    },
  };
}
