rm -rf artifacts types dist compiled

# Compile typechain to create contracts definitions and create factory
# instances. Hardhat typechain will not make factory definitions, so we'll
# compile the factory instances manually with tsc to create the defintions in
# the next step.
npx hardhat compile
