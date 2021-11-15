const blk = require("./blockchain");
const abi = require("./abi/abi.json");
const aproveAbi = require("./abi/approve.json");

const CONTRACT_ADDRESS = "0x5D6EC6d920ddC3a9a10348B903d05cACBd6C2323";

const FROM_TOKEN = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6"; // WETH
const TO_TOKEN = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"; // UNI

// Goerli
// const FROM_TOKEN = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6"; // WETH
// const TO_TOKEN = "0xdc31Ee1784292379Fbb2964b3B9C4124D8F89C60"; // DAI

const INPUT_AMT = 0.983 * 10 ** 18;
const OUTPUT_AMT = 0.803536 * 10 ** 18;

const web3Account = blk.web3http.eth.accounts.privateKeyToAccount(
  "0x"+ process.env.WALLET_PRIVATE_KEY
);

// create web3 contract object
const PairContractHTTP = new blk.web3http.eth.Contract(
  abi.abi,
  CONTRACT_ADDRESS
);
const PairContractApprove = new blk.web3http.eth.Contract(
  aproveAbi.abi,
  // [
  //   "function approve(address spender, uint256 amount) external returns (bool)"
  // ],
  FROM_TOKEN
);

// function to get reserves
const getReserves = async (ContractObj, inputAmount) => {
  // try {
  console.log("reserve");

  let exceptAmount = OUTPUT_AMT;
  console.log(exceptAmount, "---", inputAmount);

  const fundit = await ContractObj.methods
    .executeSwap(
      FROM_TOKEN,
      TO_TOKEN,
      "WETH",
      "UNI",
      "SUSHISWAP",
      "UNISWAP",
      BigInt(inputAmount),
      BigInt(exceptAmount),
      BigInt(50)
    )
    .send({
      from: web3Account.address,
      gas: 6000000,
    })
    .then((res) => {
      console.log("Success", res)
      
    })
    .catch((err) => console.log(err, "---errrorr"));
};

const approve = async (ContractObj) => {
  let inputAmount = INPUT_AMT;
  await ContractObj.methods
    .approve(CONTRACT_ADDRESS, BigInt(inputAmount))
    .send({
      from: web3Account.address,
      gas: 6000000,
    })
    .then((res) => {
      console.log(res.events);
      getReserves(PairContractHTTP,inputAmount);
    })
    .catch((err) => console.log(err, "---errrorr"));
};
blk.web3http.eth.getAccounts().then((e) => {
  console.log("WALLET get",e);
  approve(PairContractApprove).then();
});