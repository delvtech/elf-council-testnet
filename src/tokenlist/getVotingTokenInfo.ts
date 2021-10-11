import { TokenInfo } from "@uniswap/token-lists";
import hre from "hardhat";
import { ERC20Permit__factory } from "types/factories/ERC20Permit__factory";

export const { provider } = hre.ethers;
export async function getVotingTokenInfo(
  chainId: number,
  tokenAddress: string
): Promise<TokenInfo> {
  const tokenContract = ERC20Permit__factory.connect(tokenAddress, provider);

  const name = await tokenContract.name();
  const symbol = await tokenContract.symbol();
  const decimals = await tokenContract.decimals();

  return {
    chainId,
    address: tokenAddress,
    symbol,
    decimals,
    name,
  };
}
