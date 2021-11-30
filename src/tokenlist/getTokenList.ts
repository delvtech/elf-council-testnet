import { TokenList } from "@uniswap/token-lists";
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
) {
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
      airdropContract,
      optimisticGrants,
      treasury,
      gscVault,
    },
  } = addressesJson;

  console.log('Generating tokenlist.json');

  console.log('Voting');
  const elementTokenInfo = await getVotingTokenInfo(chainId, elementToken);

  console.log('Core Voting');
  const coreVotingInfo = await getCoreVotingInfo(
    chainId,
    coreVoting,
    "Element Core Voting Contract"
  );

  console.log('GSC Core Voting');
  const gscCoreVotingInfo = await getCoreVotingInfo(
    chainId,
    gscCoreVoting,
    "Element GSC Core Voting Contract"
  );

  console.log('Locking Vault');
  const lockingVaultInfo = await getLockingVaultInfo(
    chainId,
    lockingVault,
    "Element Locking Vault"
  );

  console.log('Vesting Vault');
  const vestingVaultInfo = await getLockingVaultInfo(
    chainId,
    vestingVault,
    "Element Vesting Vault"
  );

  console.log('GSC Vault');
  const gscVaultInfo = await getGscVaultInfo(
    chainId,
    gscVault,
    "Element Governance Steering Committee Vault"
  );

  console.log('Optimistic Rewards Vault');
  const optimisticRewardsVaultInfo = await getOptimisticRewardsVaultInfo(
    chainId,
    optimisticRewardsVault,
    "Element Optimistic Rewards Vault"
  );

  console.log('Optimistic Grants Vault');
  const optimisticGrantsInfo = await getOptimisticGrantsInfo(
    chainId,
    optimisticGrants,
    "Element Optimistic Grants Vault"
  );

  console.log('Airdrop');
  const airdropInfo = await getAirdropInfo(
    chainId,
    airdropContract,
    "Element Airdrop Contract"
  );

  console.log('Treasury');
  const treasuryInfo = await getTreasuryInfo(
    chainId,
    treasury,
    "Element Treasury"
  );

  console.log('Timelock');
  const timelockInfo = await getTimelockInfo(
    chainId,
    timeLock,
    "Element Timelock"
  );

  const tokenList: TokenList = {
    name,
    logoURI: "https://element.fi/logo.svg",
    timestamp: new Date().toISOString(),
    version: {
      major: 0,
      minor: 1,
      patch: 0,
    },
    tokens: [
      elementTokenInfo,
      coreVotingInfo,
      gscCoreVotingInfo,
      lockingVaultInfo,
      vestingVaultInfo,
      gscVaultInfo,
      optimisticRewardsVaultInfo,
      optimisticGrantsInfo,
      airdropInfo,
      treasuryInfo,
      timelockInfo,
    ],
  };

  const tokenListString = JSON.stringify(tokenList, null, 2);
  console.log(tokenListString);

  // TODO: We have to validate this json schema ourselves before it can be
  // published to the uniswap directory.  For now, just look at this file in
  // vscode and make sure there are no squiggles.
  fs.writeFileSync(outputPath, tokenListString);
}
