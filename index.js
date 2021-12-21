// const Big = require("big.js");
// const blk = require("./blockchain");
// var sushiApi = require("sushiswap-api");
const axios = require("axios");
const express = require("express");
const Web3 = require('web3');
const app = express();
const path = require("path");
const router = express.Router();
const mysql = require("mysql");
const { clear } = require("console");
const { clearInterval } = require("timers");
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const sushiSdk =  require('@sushiswap/sdk')
const uniSDK = require("@uniswap/sdk-core");
const uniSdkV2 = require("@uniswap/v2-sdk");
const { get } = require("http");

var con = mysql.createConnection({
  host: "testdev.rungila.com",
  user: "user1",
  password: "_kVvPeE(S!#[XE_85@",
  database: "arbitrage",
});

con.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});
let table = [];
let exchanges;
let checkEvent = false;
let intervals = {};
//**********************************    LOGIN SOCKET ********************************//
io.use(async (socket, next) => {
  if (socket.handshake.query && socket.handshake.query.client) {
    table = [];
    await con.query(
      `SELECT name as exchange_type,exchange_id FROM m_exchanges order by exchange_id asc limit 2`,
      async (err, result) => {
        if (err) throw err;
        exchanges = result;
        if (exchanges.length > 0) {
          for (let ex = 0; ex < exchanges.length; ex++) {
            new Promise(async (resolve, rejects) => {
              await con.query(
                `SELECT * FROM m_common_pair where exchange_id = '${exchanges[ex].exchange_id}' ORDER by pair_id ASC`,
                async (err, exresult) => {
                  if (err) throw err;
                  let i = 0;
                    exresult.forEach((element) => {
                      var getIndex = table.findIndex(
                        (pair) =>
                          pair.token0 === element.token0 &&
                          pair.token1 === element.token1
                      );
                      if(getIndex >= 0){
                        table[getIndex].exchanges.push({
                          name: `${exchanges[ex].exchange_type}`,
                          pairtoken: element.pairtoken,
                          price0: "",
                          price1: "",
                        });
                      } else {
                        table.push({
                          symbol: element.symbol,
                          token0: element.token0,
                          token1: element.token1,
                          exchanges: [
                            {
                              name: `${exchanges[ex].exchange_type}`,
                              pairtoken: element.pairtoken,
                              price0: "",
                              price1: "",
                            },
                          ],
                        });
                      }                      
                      i++;
                      if (exresult.length == i) {
                        resolve(1);
                      }
                      if (exchanges.length - 1 == ex) {
                        next();
                      }
                    });
                    if (exresult.length == table.length) {
                      resolve(1);
                    }
                  
                }
              );
            });
          }
        }
      }
    );
  }
}).on("connection", function (socket) {
  if (!checkEvent) {
    let setCB = async (value, i) => {
     intervals[i] = setInterval(async () => {
        let allArbitrage = [];
        for (let e = 0; e < value.exchanges.length; e++) {
          let basePariAddr = value.exchanges[e].pairtoken.toString();
          let baseExchange = value.exchanges[e].name.toString();
          let baseToken0 = value.token0.toString();
          let baseToken1 = value.token1.toString();
          let otherExchanges = value.exchanges.filter(function(element){            
              return element.name !== value.exchanges[e].name;
          });
          let getExchangeInput = new Promise((resolve, reject) => {
            try {
              let postData = {
                token0: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', //USDC
                token1: baseToken0,
              };

              let configUsdc = {
                method: "POST",
                url: `http://localhost:5000/checkUsdc/${baseExchange}`,
                headers: {
                  "Content-Type": "application/json",
                },
                data: postData,
              };
              /// API FOR GET WORTH OF USDC /////

              axios(configUsdc)
                .then(async (usdcResponse) => {
                  // if (usdcResponse.data.data.length > 0) {
                    if(0 > 1) {
                    let data = "";
                    let config = {
                      method: "get",
                      url: `http://localhost:5000/${baseExchange}/pair?pairAddress=${basePariAddr}`,                     
                      headers: { }
                    };
                    axios(config).then(async (pairResponse) => {
                      if (pairResponse.data.data.pair) {

                        let Reserve0 =
                          pairResponse.data.data.pair.reserve0
                        let Reserve1 =
                          pairResponse.data.data.pair.reserve1
                          let usdcReserve
                          if(usdcResponse.data.shuffle == 0){
                            usdcReserve =
                          usdcResponse.data.data.pairs[0].reserve0
                          } else {
                            usdcReserve =
                          usdcResponse.data.data.pairs[0].reserve1
                          }
                        
                        
                          let pairTrade;
                          let usdcInputCoins = ['1000000000','5000000000','10000000000'];
                          let usdcInputDollars = [
                            "$1000",
                            "$5000",
                            "$10000",
                          ];
                          let baseOutput = [];
                        if (baseExchange == "UNISWAP") {
                          let token0 = new uniSDK.Token(
                            1,
                            pairResponse.data.data.pair.token0.id.toString(),
                            parseInt(
                              pairResponse.data.data.pair.token0.decimals
                            )
                          );
                          let token1 = new uniSDK.Token(
                            1,
                            pairResponse.data.data.pair.token1.id.toString(),
                            parseInt(
                              pairResponse.data.data.pair.token1.decimals
                            )
                          );

                          let USDC = new uniSDK.Token(
                            1,
                            "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
                            6
                          );

                          const usdcPair = new uniSdkV2.Pair(
                            uniSDK.CurrencyAmount.fromRawAmount(
                              USDC,
                              usdcReserve
                            ),
                            uniSDK.CurrencyAmount.fromRawAmount(
                              token0,
                              Reserve0
                            )
                          );
                          let pair = new uniSdkV2.Pair(
                            uniSDK.CurrencyAmount.fromRawAmount(
                              token0,
                              Reserve0
                            ),
                            uniSDK.CurrencyAmount.fromRawAmount(
                              token1,
                              Reserve1
                            )
                          );
                          for (
                            let uCoin = 0;
                            uCoin < usdcInputCoins.length;
                            uCoin++
                          ) {
                            let usdcTrade = await new uniSdkV2.Trade(
                              new uniSdkV2.Route([usdcPair], USDC, token0),
                              uniSDK.CurrencyAmount.fromRawAmount(
                                USDC,
                                usdcInputCoins[uCoin]
                              ),
                              uniSDK.TradeType.EXACT_INPUT
                            );

                            let inputValue =
                              usdcTrade.outputAmount.toSignificant(6) *
                              10 **
                                parseInt(
                                  pairResponse.data.data.pair.token0.decimals
                                );
                            pairTrade = await new uniSdkV2.Trade(
                              new uniSdkV2.Route([pair], token0, token1),
                              uniSDK.CurrencyAmount.fromRawAmount(
                                token0,
                                inputValue
                              ),
                              uniSDK.TradeType.EXACT_INPUT
                            );

                            baseOutput.push({usdcInput:usdcTrade.outputAmount.toSignificant(6),otherExinputValue: pairTrade.outputAmount.toSignificant(6),dollarWorth: usdcInputDollars[uCoin]});
                          }
                        } else if (baseExchange == "SUSHISWAP") {
                          let token0 = new sushiSdk.Token(
                            1,
                            pairResponse.data.data.pair.token0.id.toString(),
                            parseInt(
                              pairResponse.data.data.pair.token0.decimals
                            )
                          );
                          let token1 = new sushiSdk.Token(
                            1,
                            pairResponse.data.data.pair.token1.id.toString(),
                            parseInt(
                              pairResponse.data.data.pair.token1.decimals
                            )
                          );

                          let USDC = new sushiSdk.Token(
                            1,
                            "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
                            6
                          );

                          const usdcPair = new sushiSdk.Pair(
                            sushiSdk.CurrencyAmount.fromRawAmount(
                              USDC,
                              usdcReserve
                            ),
                            sushiSdk.CurrencyAmount.fromRawAmount(
                              token0,
                              Reserve0
                            )
                          );

                          let pair = new sushiSdk.Pair(
                            sushiSdk.CurrencyAmount.fromRawAmount(
                              token0,
                              Reserve0
                            ),
                            sushiSdk.CurrencyAmount.fromRawAmount(
                              token1,
                              Reserve1
                            )
                          );
                          for (
                            let uCoin = 0;
                            uCoin < usdcInputCoins.length;
                            uCoin++
                          ) {
                            let usdcTrade = new sushiSdk.Trade(
                              new sushiSdk.Route([usdcPair], USDC, token0),
                              sushiSdk.CurrencyAmount.fromRawAmount(
                                USDC,
                                usdcInputCoins[uCoin]
                              ),
                              sushiSdk.TradeType.EXACT_INPUT
                            );

                            let inputValue =
                              usdcTrade.outputAmount.toSignificant(6) *
                              10 **
                                parseInt(
                                  pairResponse.data.data.pair.token0.decimals
                                );
                            pairTrade = new sushiSdk.Trade(
                              new sushiSdk.Route([pair], token0, token1),
                              sushiSdk.CurrencyAmount.fromRawAmount(
                                token0,
                                inputValue
                              ),
                              sushiSdk.TradeType.EXACT_INPUT
                            );

                            baseOutput.push({usdcInput:usdcTrade.outputAmount.toSignificant(6),otherExinputValue: pairTrade.outputAmount.toSignificant(6),dollarWorth: usdcInputDollars[uCoin]});
                          }
                        }
                        resolve(baseOutput);
                      } else {
                        reject("Pair Not Found");
                      }
                    });
                  } else {

                    let postData = {
                      token0: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", //USDC
                      token1: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", //WETH
                    };
                                          
                      let configUsdcWeth = {
                        method: "POST",
                        url: `http://localhost:5000/checkUsdc/${baseExchange}`,
                        headers: {
                          "Content-Type": "application/json",
                        },
                        data: postData,
                      };
                    
                      axios(configUsdcWeth)
                        .then(async (usdcWethResponse) => {
                          if (usdcWethResponse.data.data) {
                            let postData = {
                              token0: baseToken0,
                              token1: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
                            };
                      if (postData.token0.toString() === postData.token1.toString()) {
                        let data = "";
                        let config = {
                          method: "get",
                          url: `http://localhost:5000/${baseExchange}/pair?pairAddress=${basePariAddr}`,
                          headers: {},
                        };
                        axios(config).then(async (pairResponse) => {
                          if (pairResponse.data.data.pair) {
                            let Reserve0 = pairResponse.data.data.pair.reserve0;
                            let Reserve1 = pairResponse.data.data.pair.reserve1;
                            let usdcReserve;
                            if (usdcResponse.data.shuffle == 0) {
                              usdcReserve =
                                usdcResponse.data.data.pairs[0].reserve0;
                            } else {
                              usdcReserve =
                                usdcResponse.data.data.pairs[0].reserve1;
                            }

                            let pairTrade;
                            let usdcInputCoins = [
                              "1000000000",
                              "5000000000",
                              "10000000000",
                            ];
                            let usdcInputDollars = ["$1000", "$5000", "$10000"];
                            let baseOutput = [];
                            if (baseExchange == "UNISWAP") {
                              let token0 = new uniSDK.Token(
                                1,
                                pairResponse.data.data.pair.token0.id.toString(),
                                parseInt(
                                  pairResponse.data.data.pair.token0.decimals
                                )
                              );
                              let token1 = new uniSDK.Token(
                                1,
                                pairResponse.data.data.pair.token1.id.toString(),
                                parseInt(
                                  pairResponse.data.data.pair.token1.decimals
                                )
                              );

                              let USDC = new uniSDK.Token(
                                1,
                                "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
                                6
                              );

                              const usdcPair = new uniSdkV2.Pair(
                                uniSDK.CurrencyAmount.fromRawAmount(
                                  USDC,
                                  usdcReserve
                                ),
                                uniSDK.CurrencyAmount.fromRawAmount(
                                  token0,
                                  Reserve0
                                )
                              );
                              let pair = new uniSdkV2.Pair(
                                uniSDK.CurrencyAmount.fromRawAmount(
                                  token0,
                                  Reserve0
                                ),
                                uniSDK.CurrencyAmount.fromRawAmount(
                                  token1,
                                  Reserve1
                                )
                              );
                              for (
                                let uCoin = 0;
                                uCoin < usdcInputCoins.length;
                                uCoin++
                              ) {
                                let usdcTrade = await new uniSdkV2.Trade(
                                  new uniSdkV2.Route([usdcPair], USDC, token0),
                                  uniSDK.CurrencyAmount.fromRawAmount(
                                    USDC,
                                    usdcInputCoins[uCoin]
                                  ),
                                  uniSDK.TradeType.EXACT_INPUT
                                );

                                let inputValue =
                                  (usdcTrade.outputAmount.toSignificant(6) *
                                  10 **
                                    parseInt(
                                      pairResponse.data.data.pair.token0
                                        .decimals
                                    )).toFixed();
                                    inputValue = Number(inputValue).toLocaleString().replace(/,/g,"")
                                pairTrade = await new uniSdkV2.Trade(
                                  new uniSdkV2.Route([pair], token0, token1),
                                  uniSDK.CurrencyAmount.fromRawAmount(
                                    token0,
                                    inputValue
                                  ),
                                  uniSDK.TradeType.EXACT_INPUT
                                );

                                baseOutput.push({
                                  usdcInput:
                                    usdcTrade.outputAmount.toSignificant(6),
                                  otherExinputValue:
                                    pairTrade.outputAmount.toSignificant(6),
                                  dollarWorth: usdcInputDollars[uCoin],
                                });
                              }
                            } else if (baseExchange == "SUSHISWAP") {
                              let token0 = new sushiSdk.Token(
                                1,
                                Web3.utils.toChecksumAddress(pairResponse.data.data.pair.token0.id.toString()),
                                parseInt(
                                  pairResponse.data.data.pair.token0.decimals
                                )
                              );
                              let token1 = new sushiSdk.Token(
                                1,
                                Web3.utils.toChecksumAddress(pairResponse.data.data.pair.token1.id.toString()),
                                parseInt(
                                  pairResponse.data.data.pair.token1.decimals
                                )
                              );

                              let USDC = new sushiSdk.Token(
                                1,
                                "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
                                6
                              );

                              const usdcPair = new sushiSdk.Pair(
                                sushiSdk.CurrencyAmount.fromRawAmount(
                                  USDC,
                                  usdcReserve
                                ),
                                sushiSdk.CurrencyAmount.fromRawAmount(
                                  token0,
                                  Reserve0
                                )
                              );

                              let pair = new sushiSdk.Pair(
                                sushiSdk.CurrencyAmount.fromRawAmount(
                                  token0,
                                  Reserve0
                                ),
                                sushiSdk.CurrencyAmount.fromRawAmount(
                                  token1,
                                  Reserve1
                                )
                              );
                              for (
                                let uCoin = 0;
                                uCoin < usdcInputCoins.length;
                                uCoin++
                              ) {
                                let usdcTrade = new sushiSdk.Trade(
                                  new sushiSdk.Route([usdcPair], USDC, token0),
                                  sushiSdk.CurrencyAmount.fromRawAmount(
                                    USDC,
                                    usdcInputCoins[uCoin]
                                  ),
                                  sushiSdk.TradeType.EXACT_INPUT
                                );

                                let inputValue =
                                  (usdcTrade.outputAmount.toSignificant(6) *
                                  10 **
                                    parseInt(
                                      pairResponse.data.data.pair.token0
                                        .decimals
                                    )).toFixed();
                                inputValue = Number(inputValue).toLocaleString().replace(/,/g,"")
                                pairTrade = new sushiSdk.Trade(
                                  new sushiSdk.Route([pair], token0, token1),
                                  sushiSdk.CurrencyAmount.fromRawAmount(
                                    token0,
                                    inputValue
                                  ),
                                  sushiSdk.TradeType.EXACT_INPUT
                                );

                                baseOutput.push({
                                  usdcInput:
                                    usdcTrade.outputAmount.toSignificant(6),
                                  otherExinputValue:
                                    pairTrade.outputAmount.toSignificant(6),
                                  dollarWorth: usdcInputDollars[uCoin],
                                });
                              }
                            }
                            resolve(baseOutput);
                          } else {
                            reject("Pair Not Found");
                          }
                        });
                      } else {
                        let configWethToken0 = {
                          method: "POST",
                          url: `http://localhost:5000/checkUsdc/${baseExchange}`,
                          headers: {
                            "Content-Type": "application/json",
                          },
                          data: postData,
                        };
                        axios(configWethToken0)
                          .then(async (wethToken0) => {
                            if (wethToken0.data.data) {
                              let data = "";
                              let config = {
                                method: "get",
                                url: `http://localhost:5000/${baseExchange}/pair?pairAddress=${basePariAddr}`,
                                headers: {},
                              };
                              axios(config).then(async (pairResponse) => {
                                if (pairResponse.data.data.pair) {
                                  let Reserve0 =
                                    pairResponse.data.data.pair.reserve0;
                                  let Reserve1 =
                                    pairResponse.data.data.pair.reserve1;

                                  let usdcWethReserve0;
                                  let usdcWethReserve1;
                                  let wethToken0Reserve0;
                                  let wethToken0Reserve1;

                                  usdcWethReserve0 =
                                    usdcWethResponse.data.data.pairs[0].reserve0;

                                  usdcWethReserve1 =
                                    usdcWethResponse.data.data.pairs[0].reserve1;

                                  if (wethToken0.data.shuffle == 0) {
                                    wethToken0Reserve0 =
                                      wethToken0.data.data.pairs[0].reserve0;

                                    wethToken0Reserve1 =
                                      wethToken0.data.data.pairs[0].reserve1;
                                  } else {
                                    wethToken0Reserve0 =
                                      wethToken0.data.data.pairs[0].reserve1;

                                    wethToken0Reserve1 =
                                      wethToken0.data.data.pairs[0].reserve0;
                                  }

                                  let pairTrade;
                                  let usdcInputCoins = [
                                    "1000000000",
                                    "5000000000",
                                    "10000000000",
                                  ];
                                  let usdcInputDollars = [
                                    "$1000",
                                    "$5000",
                                    "$10000",
                                  ];
                                  let baseOutput = [];
                                  if (baseExchange == "UNISWAP") {
                                    let token0 = new uniSDK.Token(
                                      1,
                                      pairResponse.data.data.pair.token0.id.toString(),
                                      parseInt(
                                        pairResponse.data.data.pair.token0
                                          .decimals
                                      )
                                    );
                                    let token1 = new uniSDK.Token(
                                      1,
                                      pairResponse.data.data.pair.token1.id.toString(),
                                      parseInt(
                                        pairResponse.data.data.pair.token1
                                          .decimals
                                      )
                                    );

                                    let USDC = new uniSDK.Token(
                                      1,
                                      Web3.utils.toChecksumAddress("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"),
                                      6
                                    );
                                    let WETH = new uniSDK.Token(
                                      1,
                                      Web3.utils.toChecksumAddress("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"),
                                      18
                                    );

                                    let usdcPair = new uniSdkV2.Pair(
                                      uniSDK.CurrencyAmount.fromRawAmount(
                                        USDC,
                                        usdcWethReserve0
                                      ),
                                      uniSDK.CurrencyAmount.fromRawAmount(
                                        WETH,
                                        usdcWethReserve1
                                      )
                                    );
                                    let wethPair = new uniSdkV2.Pair(
                                      uniSDK.CurrencyAmount.fromRawAmount(
                                        token0,
                                        wethToken0Reserve0
                                      ),
                                      uniSDK.CurrencyAmount.fromRawAmount(
                                        WETH,
                                        wethToken0Reserve1
                                      )
                                    );
                                    let pair = new uniSdkV2.Pair(
                                      uniSDK.CurrencyAmount.fromRawAmount(
                                        token0,
                                        Reserve0
                                      ),
                                      uniSDK.CurrencyAmount.fromRawAmount(
                                        token1,
                                        Reserve1
                                      )
                                    );
                                    for (
                                      let uCoin = 0;
                                      uCoin < usdcInputCoins.length;
                                      uCoin++
                                    ) {
                                      let usdcTrade = await new uniSdkV2.Trade(
                                        new uniSdkV2.Route(
                                          [usdcPair],
                                          USDC,
                                          WETH
                                        ),
                                        uniSDK.CurrencyAmount.fromRawAmount(
                                          USDC,
                                          usdcInputCoins[uCoin]
                                        ),
                                        uniSDK.TradeType.EXACT_INPUT
                                      );

                                      let wethValue =
                                        usdcTrade.outputAmount.toSignificant(
                                          6
                                        ) *
                                        10 ** 18;

                                      wethTrade = await new uniSdkV2.Trade(
                                        new uniSdkV2.Route(
                                          [wethPair],
                                          WETH,
                                          token0
                                        ),
                                        uniSDK.CurrencyAmount.fromRawAmount(
                                          WETH,
                                          wethValue
                                        ),
                                        uniSDK.TradeType.EXACT_INPUT
                                      );

                                      let inputValue =
                                        (wethTrade.outputAmount.toSignificant(
                                          6
                                        ) *
                                        10 **
                                          parseInt(
                                            pairResponse.data.data.pair.token0
                                              .decimals
                                          )).toFixed();
                                          inputValue = Number(inputValue).toLocaleString().replace(/,/g,"")

                                      pairTrade = await new uniSdkV2.Trade(
                                        new uniSdkV2.Route(
                                          [pair],
                                          token0,
                                          token1
                                        ),
                                        uniSDK.CurrencyAmount.fromRawAmount(
                                          token0,
                                          inputValue
                                        ),
                                        uniSDK.TradeType.EXACT_INPUT
                                      );

                                      baseOutput.push({
                                        usdcInput:
                                          wethTrade.outputAmount.toSignificant(
                                            6
                                          ),
                                        otherExinputValue:
                                          pairTrade.outputAmount.toSignificant(
                                            6
                                          ),
                                        dollarWorth: usdcInputDollars[uCoin],
                                      });
                                    }
                                  } else if (baseExchange == "SUSHISWAP") {
                                    let token0 = new sushiSdk.Token(
                                      1,
                                      Web3.utils.toChecksumAddress(pairResponse.data.data.pair.token0.id.toString()),
                                      parseInt(
                                        pairResponse.data.data.pair.token0
                                          .decimals
                                      )
                                    );
                                    let token1 = new sushiSdk.Token(
                                      1,
                                      Web3.utils.toChecksumAddress(pairResponse.data.data.pair.token1.id.toString()),
                                      parseInt(
                                        pairResponse.data.data.pair.token1
                                          .decimals
                                      )
                                    );

                                    let USDC = new sushiSdk.Token(
                                      1,
                                      Web3.utils.toChecksumAddress("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"),
                                      6
                                    );
                                    let WETH = new sushiSdk.Token(
                                      1,
                                      Web3.utils.toChecksumAddress("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"),
                                      18
                                    );

                                    let usdcPair = new sushiSdk.Pair(
                                      sushiSdk.CurrencyAmount.fromRawAmount(
                                        USDC,
                                        usdcWethReserve0
                                      ),
                                      sushiSdk.CurrencyAmount.fromRawAmount(
                                        WETH,
                                        usdcWethReserve1
                                      )
                                    );
                                    let wethPair = new sushiSdk.Pair(
                                      sushiSdk.CurrencyAmount.fromRawAmount(
                                        token0,
                                        wethToken0Reserve0
                                      ),
                                      sushiSdk.CurrencyAmount.fromRawAmount(
                                        WETH,
                                        wethToken0Reserve1
                                      )
                                    );
                                    let pair = new sushiSdk.Pair(
                                      sushiSdk.CurrencyAmount.fromRawAmount(
                                        token0,
                                        Reserve0
                                      ),
                                      sushiSdk.CurrencyAmount.fromRawAmount(
                                        token1,
                                        Reserve1
                                      )
                                    );
                                    for (
                                      let uCoin = 0;
                                      uCoin < usdcInputCoins.length;
                                      uCoin++
                                    ) {
                                      let usdcTrade = await new sushiSdk.Trade(
                                        new sushiSdk.Route(
                                          [usdcPair],
                                          USDC,
                                          WETH
                                        ),
                                        sushiSdk.CurrencyAmount.fromRawAmount(
                                          USDC,
                                          usdcInputCoins[uCoin]
                                        ),
                                        sushiSdk.TradeType.EXACT_INPUT
                                      );

                                      let wethValue =
                                        usdcTrade.outputAmount.toSignificant(
                                          6
                                        ) *
                                        10 ** 18;

                                      wethTrade = await new sushiSdk.Trade(
                                        new sushiSdk.Route(
                                          [wethPair],
                                          WETH,
                                          token0
                                        ),
                                        sushiSdk.CurrencyAmount.fromRawAmount(
                                          WETH,
                                          wethValue
                                        ),
                                        sushiSdk.TradeType.EXACT_INPUT
                                      );

                                      let inputValue =
                                        (wethTrade.outputAmount.toSignificant(
                                          6
                                        ) *
                                        10 **
                                          parseInt(
                                            pairResponse.data.data.pair.token0
                                              .decimals
                                          )).toFixed();
                                        inputValue = Number(inputValue).toLocaleString().replace(/,/g,"")

                                      pairTrade = await new sushiSdk.Trade(
                                        new sushiSdk.Route(
                                          [pair],
                                          token0,
                                          token1
                                        ),
                                        sushiSdk.CurrencyAmount.fromRawAmount(
                                          token0,
                                          inputValue
                                        ),
                                        sushiSdk.TradeType.EXACT_INPUT
                                      );

                                      baseOutput.push({
                                        usdcInput:
                                          wethTrade.outputAmount.toSignificant(
                                            6
                                          ),
                                        otherExinputValue:
                                          pairTrade.outputAmount.toSignificant(
                                            6
                                          ),
                                        dollarWorth: usdcInputDollars[uCoin],
                                      });
                                    }
                                  }
                                  resolve(baseOutput);
                                } else {
                                  reject("Pair Not Found");
                                }
                              });
                            }
                          })
                          .catch(function (error) {
                            reject(error.stack);
                          });
                      }
                          } else {
                            resolve([]);
                          }
                        })
                        .catch(function (error) {
                          reject(error.stack);
                        });
                    
                  }
                })
                .catch(function (error) {
                  reject(error.stack);
                });
            } catch (error) {
              reject(error.stack);
            }
          });
          
            let uniswapInput = await getExchangeInput;
            let worthThourArbit = await checkOtherExchange(uniswapInput,otherExchanges,baseExchange,baseToken0,baseToken1);
            allArbitrage.push(worthThourArbit);

        }
        let tokenIds = value.token0.toString()+value.token1.toString();
        // console.log(tokenIds,"--",allArbitrage,"---all arbit")
        io.sockets.emit(tokenIds,
          allArbitrage
        );
      }, 30000);
    };

    let checkOtherExchange = async (baseOutputtValue,exchanges,baseExchange,baseToken0,baseToken1) => {      
      let arbitrage = {}
      if(baseOutputtValue.length > 0){ 

        for(let j=0; j < exchanges.length; j++){
            let otherPariAddr = exchanges[j].pairtoken.toString();
            let otherExchange = exchanges[j].name.toString();
            let getExchangeOutput = new Promise((resolve, reject) => {
                let data = "";
                let config = {
                  method: "get",
                  url: `http://localhost:5000/${otherExchange}/pair?pairAddress=${otherPariAddr}`,
                  headers: {},
                };
                axios(config).then(async (pairResponse) => {
                  if (pairResponse.data.data.pair) {
                    let otherReserve0 = pairResponse.data.data.pair.reserve0.replace(
                      ".",
                      ""
                    );
                    let otherReserve1 = pairResponse.data.data.pair.reserve1.replace(
                      ".",
                      ""
                    );
                    
  
                    let pairTrade;
                    let otherOutputs = []
                    if(otherExchange == "SUSHISWAP") {
  
                      let token0 = new sushiSdk.Token(
                        1,
                        Web3.utils.toChecksumAddress(pairResponse.data.data.pair.token0.id.toString()),
                        parseInt(pairResponse.data.data.pair.token0.decimals)
                      );
                      let token1 = new sushiSdk.Token(
                        1,
                        Web3.utils.toChecksumAddress(pairResponse.data.data.pair.token1.id.toString()),
                        parseInt(pairResponse.data.data.pair.token1.decimals)
                      );
                      let pair = new sushiSdk.Pair(
                        sushiSdk.CurrencyAmount.fromRawAmount(token0, otherReserve0),
                        sushiSdk.CurrencyAmount.fromRawAmount(token1, otherReserve1)
                      );
  
                      for(let uInputs = 0; uInputs < baseOutputtValue.length; uInputs++ ){
  
                        let decimalInputValue =
                        (baseOutputtValue[uInputs].otherExinputValue *
                      10 ** parseInt(pairResponse.data.data.pair.token1.decimals)).toFixed();

                      decimalInputValue = Number(decimalInputValue).toLocaleString().replace(/,/g,"")
                      

                          //console.log(pairResponse.data.data.pair.token1.decimals,"---1")
                          //console.log(baseOutputtValue[uInputs].otherExinputValue,"---2")
                          //console.log(pairResponse.data.data.pair.id,"---3")
                        pairTrade = new sushiSdk.Trade(
                          new sushiSdk.Route([pair], token1, token0),
                          sushiSdk.CurrencyAmount.fromRawAmount(token1, decimalInputValue),
                          sushiSdk.TradeType.EXACT_INPUT
                        );
                        let diffExchange = pairTrade.outputAmount.toSignificant(6) - baseOutputtValue[uInputs].usdcInput;
                        let percent = diffExchange/baseOutputtValue[uInputs].usdcInput*100;
                        
                        otherOutputs.push({exchage:`${baseExchange}(${baseOutputtValue[uInputs].usdcInput})->${otherExchange}(${pairTrade.outputAmount.toSignificant(6)}): (${baseOutputtValue[uInputs].dollarWorth})`, outputValue: pairTrade.outputAmount.toSignificant(6),otherExinput: baseOutputtValue[uInputs].otherExinputValue, BaseInput: baseOutputtValue[uInputs].usdcInput,arbitRange:percent,baseToken0: baseOutputtValue[uInputs].baseToken0,baseToken1: baseOutputtValue[uInputs].baseToken1})
                      }
  
                    } else if(otherExchange == "UNISWAP") {
  
                      let token0 = new uniSDK.Token(
                        1, 
                        pairResponse.data.data.pair.token0.id.toString(),
                        parseInt(pairResponse.data.data.pair.token0.decimals)
                      );
                      let token1 = new uniSDK.Token(
                        1,
                        pairResponse.data.data.pair.token1.id.toString(),
                        parseInt(pairResponse.data.data.pair.token1.decimals)
                      );
  
                      let pair = new uniSdkV2.Pair(
                        uniSDK.CurrencyAmount.fromRawAmount(token0, otherReserve0),
                        uniSDK.CurrencyAmount.fromRawAmount(token1, otherReserve1)
                      );
  
                      for(let uInputs = 0; uInputs < baseOutputtValue.length; uInputs++ ){
  
                        let decimalInputValue =
                        (baseOutputtValue[uInputs].otherExinputValue *
                      10 ** parseInt(pairResponse.data.data.pair.token1.decimals)).toFixed();
                          
                      decimalInputValue = Number(decimalInputValue).toLocaleString().replace(/,/g,"")
  
                        pairTrade = new uniSdkV2.Trade(
                          new uniSdkV2.Route([pair], token1, token0),
                          uniSDK.CurrencyAmount.fromRawAmount(token1, decimalInputValue),
                          uniSDK.TradeType.EXACT_INPUT
                        );
                        let diffExchange = pairTrade.outputAmount.toSignificant(6) - baseOutputtValue[uInputs].usdcInput;
                        let percent = diffExchange/baseOutputtValue[uInputs].usdcInput*100;
                        otherOutputs.push({exchage:`${baseExchange}(${baseOutputtValue[uInputs].usdcInput})->${otherExchange}(${pairTrade.outputAmount.toSignificant(6)}): (${baseOutputtValue[uInputs].dollarWorth})`, outputValue: pairTrade.outputAmount.toSignificant(6),otherExinput: baseOutputtValue[uInputs].otherExinputValue, BaseInput: baseOutputtValue[uInputs].usdcInput,arbitRange:percent,baseToken0: baseOutputtValue[uInputs].baseToken0,baseToken1: baseOutputtValue[uInputs].baseToken1})
                      }
  
  
                      
                    }
                    
                    resolve(otherOutputs);
                  } else {
                    reject(1);
                  }
                });
              
            });
  
            let getValues = await getExchangeOutput;
            arbitrage[baseExchange] = getValues
            arbitrage['exchange'] = baseExchange
            arbitrage['tokenIds'] = baseToken0.toString()+baseToken1.toString()
        }
      }
      return arbitrage;
    }
     
    checkEvent = true;
    for (let i = 0; i < table.length; i++) {
      setCB(table[i]);
    }
  }
});

router.get("/getPrice", async (req, res, next) => {
  res.json(table);
});

router.get("/", function (req, res) {
  res.sendFile(path.join(__dirname + "/demo.html"));
});

app.use("/", router);
server.listen(3000);
