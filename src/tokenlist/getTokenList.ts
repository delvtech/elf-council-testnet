import { TokenList } from "@uniswap/token-lists";
import fs from "fs";
import { AddressesJsonFile } from "src/addresses/AddressesJsonFile";
import { getCoreVotingInfo } from "src/tokenlist/getCoreVotingInfo";
import { getLockingVaultInfo } from "src/tokenlist/getLockingVaultInfo";
import { getOptimisticRewardsVaultInfo } from "src/tokenlist/getOptimisticRewardsVaultInfo";
import { getVotingTokenInfo } from "src/tokenlist/getVotingTokenInfo";
import { tags } from "src/tokenlist/tags";

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
      lockingVault,
      optimisticRewardsVault,
      gscVault,
    },
  } = addressesJson;

  const elementTokenInfo = await getVotingTokenInfo(chainId, elementToken);

  const coreVotingInfo = await getCoreVotingInfo(
    chainId,
    coreVoting,
    "Element Core Voting Contract",
    "ELFI-CVC"
  );

  const gscCoreVotingInfo = await getCoreVotingInfo(
    chainId,
    gscCoreVoting,
    "Element GSC Core Voting Contract",
    "ELFI-GSC-CVC"
  );

  const lockingVaultInfo = await getLockingVaultInfo(
    chainId,
    lockingVault,
    "Element Locking Vault",
    "ELFI-LV"
  );

  const optimisticRewardsVaultInfo = await getOptimisticRewardsVaultInfo(
    chainId,
    optimisticRewardsVault,
    "Element Optimistic Rewards Vault",
    "ELFI-ORV"
  );

  const gscVaultInfo = await getGscVaultInfo(
    chainId,
    gscVault,
    "Element Governance Steering Committee Vault",
    "ELFI-GSC"
  );

  const tokenList: TokenList = {
    name,
    logoURI: "https://element.fi/logo.svg",
    tags,
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
      optimisticRewardsVaultInfo,
    ],
  };

  const tokenListString = JSON.stringify(tokenList, null, 2);
  console.log(tokenListString);

  // TODO: We have to validate this json schema ourselves before it can be
  // published to the uniswap directory.  For now, just look at this file in
  // vscode and make sure there are no squiggles.
  fs.writeFileSync(outputPath, tokenListString);
}
