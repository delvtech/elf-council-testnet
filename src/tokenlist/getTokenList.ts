import { TokenList } from "@uniswap/token-lists";
import fs from "fs";
import { AddressesJsonFile } from "src/addresses/AddressesJsonFile";
import { getCoreVotingInfo } from "src/tokenlist/getCoreVotingInfo";
import { getVotingTokenInfo } from "src/tokenlist/getVotingTokenInfo";
import { tags } from "src/tokenlist/tags";

export async function getTokenList(
  addressesJson: AddressesJsonFile,
  name: string,
  outputPath: string
) {
  const {
    chainId,
    addresses: { elementToken, coreVoting, gscCoreVoting },
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
    coreVoting,
    "Element GSC Core Voting Contract",
    "ELFI-GSC-CVC"
  );

  const lockingVaultInfo = await getLockingVaultInfo();

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
    tokens: [elementTokenInfo, coreVotingInfo, gscCoreVotingInfo],
  };

  const tokenListString = JSON.stringify(tokenList, null, 2);
  console.log(tokenListString);

  // TODO: We have to validate this json schema ourselves before it can be
  // published to the uniswap directory.  For now, just look at this file in
  // vscode and make sure there are no squiggles.
  fs.writeFileSync(outputPath, tokenListString);
}
