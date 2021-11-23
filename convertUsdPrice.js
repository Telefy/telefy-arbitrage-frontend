// const {Fetcher } = require('@uniswap/sdk');

// const { CurrencyAmount, Percent, Token, TradeType } = require('@uniswap/sdk-core');
// const { Pair,ChainId, Route, Trade} = require('@uniswap/v2-sdk');
const uniSDK = require('@uniswap/sdk-core');
const { Interface } = require('@ethersproject/abi');
const uniSdkV2 = require('@uniswap/v2-sdk')
const {  abi } = require('@uniswap/v2-core/build/IUniswapV2Pair.json')

const init = async () => {

    // const token0 = new uniSDK.Token(1, '0x6b175474e89094c44da98b954eedeac495271d0f', 18) //DAI
    // const token0 = new uniSDK.Token(1, '0x1337def16f9b486faed0293eb623dc8395dfe46a', 18) //Armor
    // const token1 = new uniSDK.Token(1, '0x6b175474e89094c44da98b954eedeac495271d0f', 18) //DAI
    
    const token0 = new uniSDK.Token(1, '0x9040e237c3bf18347bb00957dc22167d0f2b999d', 18) //Armor
    const token1 = new uniSDK.Token(1, '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', 18) //DAI


 
  //   const USDC = new uniSDK.Token(1, '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', 6)

  //   const WETH = new uniSDK.Token(1, '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', 18)
    
  //   const usdcWethPair = new uniSdkV2.Pair(
  //     uniSDK.CurrencyAmount.fromRawAmount(USDC,115842382683226),
  //     uniSDK.CurrencyAmount.fromRawAmount(WETH, 27966097637350555369135),
  //     )

  //     let usdcInput  = 1000 * 10 ** 6;

  //  const trade =  new uniSdkV2.Trade(
  //       new uniSdkV2.Route([usdcWethPair], USDC,WETH),
  //       uniSDK.CurrencyAmount.fromRawAmount(USDC, usdcInput),
  //       uniSDK.TradeType.EXACT_INPUT
  //     )

  // let usdcOutputWeth  = trade.outputAmount.toSignificant(6) * 10 ** 18;

  //     const wethToken0 = new uniSdkV2.Pair(
  //       uniSDK.CurrencyAmount.fromRawAmount(token0,10007448814223306040066452),
  //       uniSDK.CurrencyAmount.fromRawAmount(WETH,311207677696278376513),
  //       )


  //       const tradeWethToken0 =  new uniSdkV2.Trade(
  //         new uniSdkV2.Route([wethToken0], WETH,token0),
  //         uniSDK.CurrencyAmount.fromRawAmount(WETH, usdcOutputWeth),
  //         uniSDK.TradeType.EXACT_INPUT
  //       )

  // let token0InputValue  = tradeWethToken0.outputAmount.toSignificant(6) * 10 ** 18;
  let token0InputValue  = 15000 * 10 ** 18;

    
      //  console.log(tradeWethToken0.outputAmount.toSignificant(6))
  
  const pair = new uniSdkV2.Pair(
      uniSDK.CurrencyAmount.fromRawAmount(token0,147952690356781124604227),
      uniSDK.CurrencyAmount.fromRawAmount(token1,23262691042150076168),
      )

   const trade1 =  new uniSdkV2.Trade(
        new uniSdkV2.Route([pair], token0,token1),
        uniSDK.CurrencyAmount.fromRawAmount(token0, token0InputValue),
        uniSDK.TradeType.EXACT_INPUT
      )

      console.log(trade1.outputAmount.toSignificant(6))

};


init();