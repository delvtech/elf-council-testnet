import { TokenInfo } from "@uniswap/token-lists";
import { formatEther } from "ethers/lib/utils";
import hre from "hardhat";
import { TokenListTag } from "src/tokenlist/types";
import { LockingVault__factory } from "types";

export const { provider } = hre.ethers;
export async function getLockingVaultInfo(
  chainId: number,
  tokenAddress: string,
  name: string,
  symbol: string
): Promise<TokenInfo> {
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
    symbol,
    extensions: {
      token,
      staleBlockLag: formatEther(staleBlockLag),
    },
    tags: [TokenListTag.ELEMENT_GOVERNANCE_TOKEN],
  };
}
