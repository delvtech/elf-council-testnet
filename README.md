# elf-council-testnet

Local testnet for developing against the elf-council contracts

# Setup

First, some initialization, in a terminal window run:

```bash
npm ci
npm run build-contracts
npm start
```

Next, you'll have to do some Metamask set up:
  - In the terminal where you just launched the etereum testnet, grab the private key for one of the
    addresses, usually the 2nd one that starts with 0x7099..
  - In metamask, add a new account with that private key, name it Hardhat Signer #1 (or whichever
    one you chose).
  - In metmask, add a new Cutom RPC: Click the netowrk dropdown at the top, select Custom RPC, fill
    out the settings with:
      - Network Name: Hardhart Network
      - New RPC URL: http://localhost:8545/ (not https!)
      - Chain ID: 31337

# To Run

You need to start the hardhat local ethereum testnet:

```bash
npm run start
```

Next, you'll need to set up an account with Ethernal. If you don't have an account, go to
https://app.tryethernal.com to set one up and then follow the instructions:
  - Create a new workspace.
  - You'll want to name the workspace 'Hardhat Network' (case sensistive).
  - The RPC Host is http://localhost:8545  (not https!)

You'll then use those credentials to login on the command line.  This session should stay alive as
long as you keep the terminal session alive.  After that, run the ethernal-listen command to have
ethernal listen for transactions and contract information. app.tryethernal.com will update
automatically.

So, in a second terminal window run:
```bash
npx ethernal login
npm run ethernal-listen
```

In a third terminal window run the following command to deploy the contracts:
```bash
npm run deploy-contracts
# run this n times to create n dummy proposals that are linked to snapshot proposals.
npm run test-proposal
```

Now the testnet is up and running.

# To Reset

If you make code changes to the testnet, or need to restart the local testnet for any reason, then
you'll need to reset ethernal.  to do this run:

```bash
npm run reset-ethernal
```

This will erase all the ethernal blockchain explorer data.  This can also be done on the website.
If you didn't name your workspace 'Hardhat Network', you'll need to run the command directly:
```
npx ethernal reset <YOUR_WORKSPACE_NAME>
```
You can also do this from the Settings page on app.tryethernal.com