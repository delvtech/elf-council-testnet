import { getTokenList } from "src/tokenlist/getTokenList";
import addressesJson from "src/addresses/addresses.json";

// Generate the testnet.tokenlist.json file
getTokenList(
  addressesJson,
  "Testnet token list",
  "src/tokenlist/tokenlist.json"
)
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
