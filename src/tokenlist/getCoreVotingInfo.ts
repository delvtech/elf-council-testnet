import { TokenInfo } from "@uniswap/token-lists";
import hre from "hardhat";
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
    symbol: "",
    extensions: {
      baseQuorum: baseQuorum.toNumber(),
      lockDuration: lockDuration.toNumber(),
      minProposalPower: minProposalPower.toNumber(),
      extraVoteTime: extraVoteTime.toNumber(),
    },
  };
}
