// const {Fetcher } = require('@uniswap/sdk');

// const { CurrencyAmount, Percent, Token, TradeType } = require('@uniswap/sdk-core');
// const { Pair,ChainId, Route, Trade} = require('@uniswap/v2-sdk');
const uniSDK = require('@uniswap/sdk-core');
// const { Interface } = require('@ethersproject/abi');
const uniSdkV2 = require('@uniswap/v2-sdk')
// const uniSdkV2 = require('@uniswap/v2-sdk')
// const {  abi } = require('@uniswap/v2-core/build/IUniswapV2Pair.json')

const init = async () => {

    // const token0 = new uniSDK.Token(1, '0x6b175474e89094c44da98b954eedeac495271d0f', 18) //DAI
    // const token0 = new uniSDK.Token(1, '0x1337def16f9b486faed0293eb623dc8395dfe46a', 18) //Armor
    // const token1 = new uniSDK.Token(1, '0x6b175474e89094c44da98b954eedeac495271d0f', 18) //DAI
    
    const token0 = new uniSDK.Token(1, '0x8a9c67fee641579deba04928c4bc45f66e26343a', 18) //JRT
    const token1 = new uniSDK.Token(1, '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', 18) //WETH


 
    const USDC = new uniSDK.Token(1, '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', 6)

    const WETH = new uniSDK.Token(1, '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', 18)
    
    // const usdcWethPair = new uniSdkV2.Pair(
    //   uniSDK.CurrencyAmount.fromRawAmount(USDC,142139996863239),
    //   uniSDK.CurrencyAmount.fromRawAmount(WETH, 32243301965529220576233),
    //   )
    const usdcWethPair = new uniSdkV2.Pair(
      uniSDK.CurrencyAmount.fromRawAmount(USDC,138801210428588),
      uniSDK.CurrencyAmount.fromRawAmount(WETH, 32318067562345794383594),
      )

      // const usdcWethPair = new uniSdkV2.Pair(
      //   uniSDK.CurrencyAmount.fromRawAmount(USDC,11542460139705),
      //   uniSDK.CurrencyAmount.fromRawAmount(WETH, 26309653272795829467098),
      //   )

      let usdcInput  = 1000 * 10 ** 6;

   const trade =  new uniSdkV2.Trade(
        new uniSdkV2.Route([usdcWethPair], USDC,WETH),
        uniSDK.CurrencyAmount.fromRawAmount(USDC, usdcInput),
        uniSDK.TradeType.EXACT_INPUT
      )

  let usdcOutputWeth  = trade.outputAmount.toSignificant(6) * 10 ** 18;

      const wethToken0 = new uniSdkV2.Pair(
        uniSDK.CurrencyAmount.fromRawAmount(token0,42411576098929785218427),
        uniSDK.CurrencyAmount.fromRawAmount(WETH,13454596427058597389),
        )


        const tradeWethToken0 =  new uniSdkV2.Trade(
          new uniSdkV2.Route([wethToken0], WETH,token0),
          uniSDK.CurrencyAmount.fromRawAmount(WETH, usdcOutputWeth),
          uniSDK.TradeType.EXACT_INPUT
        )

  let token0InputValue  = tradeWethToken0.outputAmount.toSignificant(6) * 10 ** 18;

    
       console.log(tradeWethToken0.outputAmount.toSignificant(6))
  
  const pair = new uniSdkV2.Pair(
      uniSDK.CurrencyAmount.fromRawAmount(token0,42411576098929785218427),
      uniSDK.CurrencyAmount.fromRawAmount(token1,13454596427058597389),
      )

   const trade1 =  new uniSdkV2.Trade(
        new uniSdkV2.Route([pair], token0,token1),
        uniSDK.CurrencyAmount.fromRawAmount(token0, token0InputValue),
        uniSDK.TradeType.EXACT_INPUT
      )

      console.log(trade1.outputAmount.toSignificant(6))

};


init();