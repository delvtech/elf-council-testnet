import { HardhatRuntimeEnvironment } from "hardhat/types";

export async function syncContractWithEthernal(
  hre: HardhatRuntimeEnvironment,
  name: string,
  address: string
) {
  try {
    await hre.ethernal.push({
      name,
      address,
    });
  } catch (error) {
    if (isErrorWithMessage(error)) {
      console.log("error syncing contract to Ethernal, ", error.message);
    }
    console.log("error syncing contract to Ethernal", error);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isErrorWithMessage(error: any): error is ErrorWithMessage {
  return !!error?.message;
}

interface ErrorWithMessage {
  message: string;
}
