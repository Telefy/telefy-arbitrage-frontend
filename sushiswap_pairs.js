// const {Fetcher } = require('@uniswap/sdk');

// const { CurrencyAmount, Percent, Token, TradeType } = require('@sushiswap/sdk-core');

// const { Pair,ChainId, Route, Trade} = require('@uniswap/v2-sdk');
const JSBI = require('jsbi')
console.log(JSBI.BigInt(23))
// const {
//     ARCHER_ROUTER_ADDRESS,
//     ChainId,
//     Currency,
//     CurrencyAmount,
//     JSBI,
//     Token,
//     TradeType,
//     Trade,
//     Route,
//     Pair
//   } =  require('@sushiswap/sdk')
const sushiSdk =  require('@sushiswap/sdk')

const init = async () => {
    const token0 = new sushiSdk.Token(1, '0x4bd70556ae3f8a6ec6c4080a0c327b24325438f3', 18)
    const token1 = new sushiSdk.Token(1, '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', 18)

    const pair12 = new sushiSdk.Pair(
        sushiSdk.CurrencyAmount.fromRawAmount(token0,'594446091937454403768211'),
        sushiSdk.CurrencyAmount.fromRawAmount(token1,'60738837085859174605')
      )

   const trade =  new sushiSdk.Trade(
        new sushiSdk.Route([pair12], token0,token1),
        sushiSdk.CurrencyAmount.fromRawAmount(token0, 0.2*1000000000000000000),
        sushiSdk.TradeType.EXACT_INPUT
      )


      console.log(trade.priceImpact.toSignificant(6));
      console.log("=----\n",)
      console.log(trade.outputAmount.toSignificant(6));

};


init();