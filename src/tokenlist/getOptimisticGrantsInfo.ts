import { formatUnits } from "ethers/lib/utils";
import hre from "hardhat";
import { OptimisticsGrantsContractInfo } from "src/tokenlist/types";
import { ERC20Permit__factory, OptimisticGrants__factory } from "types";

export const { provider } = hre.ethers;
export async function getOptimisticGrantsInfo(
  chainId: number,
  tokenAddress: string,
  name: string
): Promise<OptimisticsGrantsContractInfo> {
  const optimisticGrantsContract = OptimisticGrants__factory.connect(
    tokenAddress,
    provider
  );

  const tokenPromise = optimisticGrantsContract.token();
  const solvencyPromise = optimisticGrantsContract.solvency();

  const [token, solvency] = await Promise.all([tokenPromise, solvencyPromise]);
  const tokenContract = ERC20Permit__factory.connect(tokenAddress, provider);
  const tokenDecimals = await tokenContract.decimals();

  return {
    chainId,
    address: tokenAddress,
    name,
    decimals: 0,
    symbol: "",
    extensions: {
      token,
      solvency: formatUnits(solvency, tokenDecimals),
    },
  };
}
