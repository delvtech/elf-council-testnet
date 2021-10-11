import { TokenInfo } from "@uniswap/token-lists";
import { formatEther } from "ethers/lib/utils";
import hre from "hardhat";
import { TokenListTag } from "src/tokenlist/types";
import { GSCVault__factory } from "types";

export const { provider } = hre.ethers;
export async function getGscVaultInfo(
  chainId: number,
  tokenAddress: string,
  name: string,
  symbol: string
): Promise<TokenInfo> {
  const gscVaultContract = GSCVault__factory.connect(tokenAddress, provider);

  const coreVotingPromise = gscVaultContract.coreVoting();
  const votingPowerBoundPromise = gscVaultContract.votingPowerBound();
  const idleDurationPromise = gscVaultContract.idleDuration();

  const [coreVoting, votingPowerBound, idleDuration] = await Promise.all([
    coreVotingPromise,
    votingPowerBoundPromise,
    idleDurationPromise,
  ]);

  return {
    chainId,
    address: tokenAddress,
    name,
    decimals: 0,
    symbol,
    extensions: {
      coreVoting,
      votingPowerBound: formatEther(votingPowerBound),
      idleDuration: formatEther(idleDuration),
    },
    tags: [TokenListTag.ELEMENT_GOVERNANCE_TOKEN],
  };
}
