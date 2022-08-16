# Cross-chain ERC20 Token

You can use this ERC20 in two network: Avalanche-Fuji Testnet and BSC Testnet.

Chains can easily change.

# Life-cycle

1. User calls `moveToOtherChain(uint256 number)` method to move his tokens to other chain.
2. Node.js app catches the event and create a signature.
3. In this project, I didn't create an API to get signature from the server. But you better do that. I am signing the data from one private key, and sendint it with the data in the same function. In a real-world project, this can't be happen.
4. User gets signature from the server.
5. User sends data with the signature to the `mint(Request memory request, bytes memory signature)` function.
6. `mint` function checks the signature and mint new tokens to the user.

# Why Signature

I know, using a signature like this decreases the security of the program. But, I didn't want to take `expected gas fee + $20` gas fee from the user, like Avalanche's Bridge did.
If you are not an expert of web2 security, you shouldn't use this in your project. Because if the verifier private key leaked, your project will be trash.

# Setting .env File

If you run this program, you need a `.env` file in your `./bridge/` directory like this:

```
VERIFIER_PK="" # Server side verifier's private key
CALLER_PK="" # Example user's private key

FUJI_ADDRESS="" # Fuji address of your token smart contract
BSC_ADDRESS="" # BSC address of your token smart contarct

# These are public rpc end-points.
FUJI_PROVIDER="https://api.avax-test.network/ext/bc/C/rpc"
BSC_PROVIDER="https://data-seed-prebsc-1-s1.binance.org:8545/"
```
