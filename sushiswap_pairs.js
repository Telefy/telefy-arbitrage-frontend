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

const initOld = async () => {
    const token0 = new sushiSdk.Token(1, '0x1337def16f9b486faed0293eb623dc8395dfe46a', 18) //ARMOR
    const token1 = new sushiSdk.Token(1, '0x6b175474e89094c44da98b954eedeac495271d0f', 18) //DAI

    const USDC = new sushiSdk.Token(1, '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', 6)


    // const usdcPair = new sushiSdk.Pair(
    //   sushiSdk.CurrencyAmount.fromRawAmount(USDC, 174032449276149),
    //     sushiSdk.CurrencyAmount.fromRawAmount(token0,40638706043399487839408),
    //   )

    //   const trade =  new sushiSdk.Trade(
    //     new sushiSdk.Route([usdcPair], USDC,token0),
    //     sushiSdk.CurrencyAmount.fromRawAmount(USDC, "1000000000"),
    //     sushiSdk.TradeType.EXACT_INPUT
    //   )


    const pair12 = new sushiSdk.Pair(
        sushiSdk.CurrencyAmount.fromRawAmount(token1,'75905493286065790676445'),
        sushiSdk.CurrencyAmount.fromRawAmount(token0,'581682816404736924727095')
      )

      // let inputValueTwo  = trade.outputAmount.toSignificant(6) * 10 ** 18;
      let inputValueTwo  = 993.269 * 10 ** 18;

   const trade1 =  new sushiSdk.Trade(
        new sushiSdk.Route([pair12], token1,token0),
        sushiSdk.CurrencyAmount.fromRawAmount(token1, `${inputValueTwo}`),
        sushiSdk.TradeType.EXACT_INPUT
      )


      
      // console.log(trade.outputAmount.toSignificant(6));
      console.log(trade1.outputAmount.toSignificant(6));

};

const init = async () => {

  // const token0 = new sushiSdk.Token(1, '0x6b175474e89094c44da98b954eedeac495271d0f', 18) //DAI
  const token0 = new sushiSdk.Token(1, '0x037a54aab062628c9bbae1fdb1583c195585fe41', 18) //Armor
  const token1 = new sushiSdk.Token(1, '0x6b175474e89094c44da98b954eedeac495271d0f', 18) //DAI



  const USDC = new sushiSdk.Token(1, '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', 6)

  const WETH = new sushiSdk.Token(1, '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', 18)
  
  const usdcWethPair = new sushiSdk.Pair(
    sushiSdk.CurrencyAmount.fromRawAmount(USDC,155022254089675),
    sushiSdk.CurrencyAmount.fromRawAmount(WETH, 38271361039401026444729),
    )

    let usdcInput  = 5000 * 10 ** 6;

 const trade =  new sushiSdk.Trade(
      new sushiSdk.Route([usdcWethPair], USDC,WETH),
      sushiSdk.CurrencyAmount.fromRawAmount(USDC, usdcInput),
      sushiSdk.TradeType.EXACT_INPUT
    )

let usdcOutputWeth  = trade.outputAmount.toSignificant(6) * 10 ** 18;



    const wethToken0 = new sushiSdk.Pair(
      sushiSdk.CurrencyAmount.fromRawAmount(token0,417684561727091076148829),
      sushiSdk.CurrencyAmount.fromRawAmount(WETH,127001507437246083776),
      )


      const tradeWethToken0 =  new sushiSdk.Trade(
        new sushiSdk.Route([wethToken0], WETH,token0),
        sushiSdk.CurrencyAmount.fromRawAmount(WETH, usdcOutputWeth),
        sushiSdk.TradeType.EXACT_INPUT
      )

let token0InputValue  = tradeWethToken0.outputAmount.toSignificant(6) * 10 ** 18;

  

const pair = new sushiSdk.Pair(
    sushiSdk.CurrencyAmount.fromRawAmount(token0,604125509513504075765605),
    sushiSdk.CurrencyAmount.fromRawAmount(token1,73102092637806108844507),
    )

 const trade1 =  new sushiSdk.Trade(
      new sushiSdk.Route([pair], token0,token1),
      sushiSdk.CurrencyAmount.fromRawAmount(token0, token0InputValue),
      sushiSdk.TradeType.EXACT_INPUT
    )

    console.log(trade1.inputAmount.toSignificant(6))
    console.log(trade1.outputAmount.toSignificant(6))

};


init();