# elf-council-testnet

Local testnet for developing against the elf-council contracts

# To Run

In a terminal window run

```bash
npm ci
npm start
```

In a second terminal window run the following.  Note that you'll need to login to ethernal.  If you
don't have an account, go to app.tryethernal.com to set one up.  You'll want to name the workspace
'Hardhat Network' (case sensistive).  You'll then use those credentials to login on the command
line.  This session should stay alive as long as you keep the terminal session alive.  After that,
run the ethernal-listen command to have ethernal listen for transactions and contract information.
app.tryethernal.com will update automatically.

```bash
npx ethernal login
npm run ethernal-listen
```

In a third terminal window run the following command to deploy the contracts.

```bash
npm run deploy-contracts
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