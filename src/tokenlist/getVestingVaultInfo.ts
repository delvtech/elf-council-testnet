import { TokenInfo } from "@uniswap/token-lists";
import hre from "hardhat";
import { VestingVault__factory } from "types";

export const { provider } = hre.ethers;
export async function getVestingVaultInfo(
  chainId: number,
  tokenAddress: string,
  name: string
): Promise<TokenInfo> {
  const vestingVaultContract = VestingVault__factory.connect(
    tokenAddress,
    provider
  );

  const tokenPromise = vestingVaultContract.token();
  const staleBlockLagPromise = vestingVaultContract.staleBlockLag();

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
