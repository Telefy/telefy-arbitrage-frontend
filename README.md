# Uniswap Price Monitor

Monitors the relative price of the token in real-time.

I've used 2 ways to fetch real-time prices

1. To continuously query the blockchain to get reserves of tokens in pair contracts.
2. Subscribe to `Sync` event of pair contract to get realtime updates.

### Note

Add HTTPS and WSS endpoints to connect to blockchain, in `.env` file.
HTTP_URL="https://goerli.infura.io/v3/848f209af9e2460fbd6a03dc959e96fa"
WSS_URL="wss://goerli.infura.io/v3/848f209af9e2460fbd6a03dc959e96fa"
WALLET_PRIVATE_KEY="89ffe7016912c892dbd513c83099b4cde7f2e3fd2f07b469241ccd078dea90ab"
WALLET_PASSWORD="Mazelon@123"


Step's to Interact with smart contract

Step 1: account private key
Step 2: token address
Step 3: input amount
Step 4: output amount
Step 5: excuteswap exchange from and two
Step 6: excuteswap symbols from and two

Goerli Sample Token Address
USDC: 0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C
WETH: 0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6
DAI: 0xdc31Ee1784292379Fbb2964b3B9C4124D8F89C60
WBTC: 0xC04B0d3107736C32e19F1c62b2aF67BE61d63a05
