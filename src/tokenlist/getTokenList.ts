import { TokenList } from "@uniswap/token-lists";
import fs from "fs";
import { AddressesJsonFile } from "src/addresses/AddressesJsonFile";
import { getVotingTokenInfo } from "src/tokenlist/getVotingTokenInfo";
import { tags } from "src/tokenlist/tags";

export async function getTokenList(
  addressesJson: AddressesJsonFile,
  name: string,
  outputPath: string
) {
  const {
    chainId,
    addresses: { elementToken },
  } = addressesJson;

  const elementTokenInfo = await getVotingTokenInfo(chainId, elementToken);

  const tokenList: TokenList = {
    name,
    logoURI: "https://element.fi/logo.svg",
    tags,
    timestamp: new Date().toISOString(),
    version: {
      // TODO: implement this
      major: 0,
      minor: 0,
      patch: 0,
    },
    tokens: [elementTokenInfo],
  };

  const tokenListString = JSON.stringify(tokenList, null, 2);
  console.log(tokenListString);

  // TODO: We have to validate this json schema ourselves before it can be
  // published to the uniswap directory.  For now, just look at this file in
  // vscode and make sure there are no squiggles.
  fs.writeFileSync(outputPath, tokenListString);
}
