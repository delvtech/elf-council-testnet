import { TokenInfo } from "@uniswap/token-lists";
import hre from "hardhat";
import { Timelock__factory } from "types";

export const { provider } = hre.ethers;

export async function getTimelockInfo(
  chainId: number,
  tokenAddress: string,
  name: string
): Promise<TokenInfo> {
  const timelockContract = Timelock__factory.connect(tokenAddress, provider);

  const waitTime = await timelockContract.waitTime();

  return {
    chainId,
    address: tokenAddress,
    name,
    decimals: 0,
    symbol: "",
    extensions: {
      waitTime: waitTime.toString(),
    },
  };
}
