const Web3 = require('web3');
const UniswapV2Pair = require("./abi/IUniswapV2Pair.json");

// const apiKey = '0f6ae9e65b364dd3b19c8793dbb1833f';
// const web3 = new Web3(new Web3.providers.HttpProvider(
//   `https://ethereum.api.nodesmith.io/v1/mainnet/jsonrpc?apiKey=${apiKey}`));

  let PAIR_ADDR = Web3.utils.toChecksumAddress("0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc");
  console.log(PAIR_ADDR)
//   const PairContractHTTP = new web3.eth.Contract(
//     UniswapV2Pair.abi,
//     PAIR_ADDR
//   );
// //   const compiled = await getCompiledContract();
// //   const contract = new web3.eth.Contract(compiled.ForTheRecord.info.abiDefinition, Constants.CONTRACT_ADDRESS);


//   const getReserves = async (ContractObj) => {
//     const _reserves = await ContractObj.methods.getReserves().call();
//    console.log(_reserves.reserve0,"---reserves11")
//    console.log(_reserves.reserve1,"---reserves22")
//   };

//   getReserves(PairContractHTTP);

// web3.eth.getBlock('latest', false).then((block) => {
//     console.log(`The latest block number was ${block.number}. It contained ${block.transactions.length} transactions.`);
// });