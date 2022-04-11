import hre from "hardhat";
import { mainnetAddressList } from "@elementfi/elf-council-tokenlist";
import {
  LockingVault__factory,
  VestingVault__factory,
} from "@elementfi/elf-council-typechain";

const STARTING_BLOCK_NUMBER = 14496292;
const MAX_WHITELIST = ;

const oneAddress =
  "0x0000000000000000000000000000000000000000000000000000000000000001";

const { provider } = hre.ethers;
const { addresses } = mainnetAddressList;
const lockingVault = LockingVault__factory.connect(
  addresses.lockingVault,
  provider
);
const vestingVault = VestingVault__factory.connect(
  addresses.lockingVault,
  provider
);
export interface WhitelistData {
  address: string;
  block: number;
}

export async function getDelegators(): Promise<{
  whitelist: string[];
  whitelistData: WhitelistData[];
  blockNumbers: number[];
}> {
  // Filters for all vote change vents
  const lockingFilter = lockingVault.filters.VoteChange(null, null, null);
  const vestingFilter = vestingVault.filters.VoteChange(null, null, null);

  // Query for events
  const lockingEvents = await lockingVault.queryFilter(
    lockingFilter,
    STARTING_BLOCK_NUMBER
  );

  const vestingEvents = await vestingVault.queryFilter(
    vestingFilter,
    STARTING_BLOCK_NUMBER
  );

  const blockNumbers: Array<number> = [];
  const whitelistSet: Set<string> = new Set();
  const whitelistData: Array<WhitelistData> = [];

  const allEvents = lockingEvents.concat(vestingEvents);
  const sortedEvents = allEvents.sort(
    (eventA, eventB) => eventA.blockNumber - eventB.blockNumber
  );

  // Add valid events to whitelist
  sortedEvents.forEach((event) => {
    if (event.args) {
      const { from } = event.args;
      const { to } = event.args;
      const { amount } = event.args;

      if (to === oneAddress || from === oneAddress) {
        return;
      }

      if (amount.gt(0) && whitelistSet.size < MAX_WHITELIST) {
        whitelistSet.add(from);
        whitelistData.push({ address: from, block: event.blockNumber });
        blockNumbers.push(event.blockNumber);
      }
    }
  });

  const whitelist = Array.from(whitelistSet.values());
  console.log({
    whitelist,
    //     whitelistData,
    whitelistLength: whitelist.length,
    blockNumbers,
  });

  return {
    whitelist: Array.from(whitelistSet.values()),
    whitelistData,
    blockNumbers,
  };
}

interface Error {
  message: string;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
getDelegators()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
