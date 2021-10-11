import { TokenInfo } from "@uniswap/token-lists";
import { formatEther } from "ethers/lib/utils";
import hre from "hardhat";
import { TokenListTag } from "src/tokenlist/types";
import { CoreVoting__factory } from "types";

export const { provider } = hre.ethers;
export async function getCoreVotingInfo(
  chainId: number,
  tokenAddress: string,
  name: string
): Promise<TokenInfo> {
  const coreVotingContract = CoreVoting__factory.connect(
    tokenAddress,
    provider
  );

  const baseQuorumPromise = coreVotingContract.baseQuorum();
  const lockDurationPromise = coreVotingContract.lockDuration();
  const minProposalPowerPromise = coreVotingContract.minProposalPower();
  const extraVoteTimePromise = coreVotingContract.extraVoteTime();

  const [baseQuorum, lockDuration, minProposalPower, extraVoteTime] =
    await Promise.all([
      baseQuorumPromise,
      lockDurationPromise,
      minProposalPowerPromise,
      extraVoteTimePromise,
    ]);

  return {
    chainId,
    address: tokenAddress,
    name,
    decimals: 0,
    symbol: "ELFI CVC",
    extensions: {
      baseQuorum: formatEther(baseQuorum.toString()),
      lockDuration: formatEther(lockDuration.toString()),
      minProposalPower: formatEther(minProposalPower.toString()),
      extraVoteTime: formatEther(extraVoteTime.toString()),
    },
    tags: [TokenListTag.ELEMENT_GOVERNANCE_TOKEN],
  };
}
