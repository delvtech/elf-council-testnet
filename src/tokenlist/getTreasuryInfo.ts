import hre from "hardhat";
import { TreasuryInfo } from "src/tokenlist/types";
import { Treasury__factory } from "types";

export const { provider } = hre.ethers;
export async function getTreasuryInfo(
  chainId: number,
  tokenAddress: string,
  name: string
): Promise<TreasuryInfo> {
  const treasuryContract = Treasury__factory.connect(tokenAddress, provider);

  const owner = await treasuryContract.owner();

  return {
    chainId,
    address: tokenAddress,
    name,
    decimals: 0,
    symbol: "",
    extensions: {
      owner,
    },
  };
}
