import { getTokenList } from "src/tokenlist/getTokenList";
import addressesJson from "src/addresses/goerli.addresses.json";

// Generate the testnet.tokenlist.json file
getTokenList(
  addressesJson,
  "Council Goerli token list",
  "src/tokenlist/goerli.tokenlist.json"
)
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
