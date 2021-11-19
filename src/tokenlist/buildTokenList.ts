import { getTokenList } from "src/tokenlist/getTokenList";
import addressesJson from "src/addresses/testnet.addresses.json";

// Generate the testnet.tokenlist.json file
getTokenList(
  addressesJson,
  "Council Testnet token list",
  "src/tokenlist/testnet.tokenlist.json"
)
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
