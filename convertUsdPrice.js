// const {Fetcher } = require('@uniswap/sdk');

// const { CurrencyAmount, Percent, Token, TradeType } = require('@uniswap/sdk-core');
// const { Pair,ChainId, Route, Trade} = require('@uniswap/v2-sdk');
const uniSDK = require('@uniswap/sdk-core');
const { Interface } = require('@ethersproject/abi');
const uniSdkV2 = require('@uniswap/v2-sdk')
const {  abi } = require('@uniswap/v2-core/build/IUniswapV2Pair.json')

const init = async () => {

    // const token0 = new uniSDK.Token(1, '0x6b175474e89094c44da98b954eedeac495271d0f', 18) //DAI
    const token0 = new uniSDK.Token(1, '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', 18) //ETH
    const token1 = new uniSDK.Token(1, '0xdac17f958d2ee523a2206206994597c13d831ec7', 6) //USDT


 
    const USDC = new uniSDK.Token(1, '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', 6)
    
    const pair12 = new uniSdkV2.Pair(
      uniSDK.CurrencyAmount.fromRawAmount(USDC, 147606763979101),
        uniSDK.CurrencyAmount.fromRawAmount(token0,31290008151688305547582),
      )

   const trade =  new uniSdkV2.Trade(
        new uniSdkV2.Route([pair12], USDC,token0),
        uniSDK.CurrencyAmount.fromRawAmount(USDC, "1000000000"),
        uniSDK.TradeType.EXACT_INPUT
      )


    const pair = new uniSdkV2.Pair(
      uniSDK.CurrencyAmount.fromRawAmount(token0,22982538402056315358196),
        uniSDK.CurrencyAmount.fromRawAmount(token1,108412876053494),
      )

      let inputValueTwo  = trade.outputAmount.toSignificant(6) * 10 ** 18;
      console.log(trade.outputAmount.toSignificant(6),"----")
   const trade1 =  new uniSdkV2.Trade(
        new uniSdkV2.Route([pair], token0,token1),
        uniSDK.CurrencyAmount.fromRawAmount(token0, `${inputValueTwo}`),
        uniSDK.TradeType.EXACT_INPUT
      )

      console.log(trade1.outputAmount.toSignificant(6))

};


init();