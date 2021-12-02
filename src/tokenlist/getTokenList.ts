import { TokenInfo, TokenList } from "@uniswap/token-lists";
import fs from "fs";
import { AddressesJsonFile } from "src/addresses/AddressesJsonFile";
import { getAirdropInfo } from "src/tokenlist/getAirdropInfo";
import { getCoreVotingInfo } from "src/tokenlist/getCoreVotingInfo";
import { getGscVaultInfo } from "src/tokenlist/getGscVaultInfo";
import { getLockingVaultInfo } from "src/tokenlist/getLockingVaultInfo";
import { getOptimisticGrantsInfo } from "src/tokenlist/getOptimisticGrantsInfo";
import { getOptimisticRewardsVaultInfo } from "src/tokenlist/getOptimisticRewardsVaultInfo";
import { getTimelockInfo } from "src/tokenlist/getTimelock";
import { getTreasuryInfo } from "src/tokenlist/getTreasuryInfo";
import { getVotingTokenInfo } from "src/tokenlist/getVotingTokenInfo";

export async function getTokenList(
  addressesJson: AddressesJsonFile,
  name: string,
  outputPath: string
): Promise<void> {
  const {
    chainId,
    addresses: {
      elementToken,
      coreVoting,
      gscCoreVoting,
      timeLock,
      lockingVault,
      vestingVault,
      optimisticRewardsVault,
      airdrop,
      optimisticGrants,
      treasury,
      gscVault,
    },
  } = addressesJson;

  console.log("Generating tokenlist.json");

  console.log("Voting");
  const elementTokenInfo = await getVotingTokenInfo(chainId, elementToken);

  console.log("Core Voting");
  const coreVotingInfo = await getCoreVotingInfo(
    chainId,
    coreVoting,
    "Element Core Voting Contract"
  );

  console.log("GSC Core Voting");
  const gscCoreVotingInfo = await getCoreVotingInfo(
    chainId,
    gscCoreVoting,
    "Element GSC Core Voting Contract"
  );

  console.log("Locking Vault");
  const lockingVaultInfo = await getLockingVaultInfo(
    chainId,
    lockingVault,
    "Element Locking Vault"
  );

  console.log("Vesting Vault");
  const vestingVaultInfo = await getLockingVaultInfo(
    chainId,
    vestingVault,
    "Element Vesting Vault"
  );

  console.log("GSC Vault");
  const gscVaultInfo = await getGscVaultInfo(
    chainId,
    gscVault,
    "Element Governance Steering Committee Vault"
  );

  console.log("Optimistic Rewards Vault");
  const optimisticRewardsVaultInfo = await getOptimisticRewardsVaultInfo(
    chainId,
    optimisticRewardsVault,
    "Element Optimistic Rewards Vault"
  );

  console.log("Airdrop");
  const airdropInfo = await getAirdropInfo(
    chainId,
    airdrop,
    "Element Airdrop Contract"
  );

  console.log("Timelock");
  const timelockInfo = await getTimelockInfo(
    chainId,
    timeLock,
    "Element Timelock"
  );
  console.log("Treasury");
  const treasuryInfo = // TODO: deploy an treasury contract to the testnet, this is currently
    // the zero address
    isZeroAddress(treasury)
      ? null
      : await getTreasuryInfo(chainId, treasury, "Element Treasury");

  console.log("Optimistic Grants Vault");
  // TODO: deploy an optimisticGrants contract to the testnet, this is currently
  // the zero address
  const optimisticGrantsInfo = isZeroAddress(optimisticGrants)
    ? null
    : await getOptimisticGrantsInfo(
        chainId,
        optimisticGrants,
        "Element Optimistic Grants Vault"
      );

  const tokens = [
    elementTokenInfo,
    coreVotingInfo,
    gscCoreVotingInfo,
    lockingVaultInfo,
    vestingVaultInfo,
    gscVaultInfo,
    optimisticRewardsVaultInfo,
    airdropInfo,
    treasuryInfo,
    timelockInfo,
    optimisticGrantsInfo,
  ] // TODO: Remove this filter once all contracts have a deployed address on the
    // testnet
    .filter((token): token is TokenInfo => {
      // filter out nulls, as some tokens haven't been implemented on the testnet
      // (optimistic grants)
      return !!token;
    });

  const tokenList: TokenList = {
    name,
    logoURI: "https://element.fi/logo.svg",
    timestamp: new Date().toISOString(),
    version: {
      major: 0,
      minor: 1,
      patch: 0,
    },
    tokens: tokens,
  };

  const tokenListString = JSON.stringify(tokenList, null, 2);
  console.log(tokenListString);

  // TODO: We have to validate this json schema ourselves before it can be
  // published to the uniswap directory.  For now, just look at this file in
  // vscode and make sure there are no squiggles.
  fs.writeFileSync(outputPath, tokenListString);
}

function isZeroAddress(address: string): boolean {
  return address === "0x0000000000000000000000000000000000000000";
}
