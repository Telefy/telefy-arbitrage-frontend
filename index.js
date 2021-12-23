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
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const sushiSdk =  require('@sushiswap/sdk')
const uniSDK = require("@uniswap/sdk-core");
const uniSdkV2 = require("@uniswap/v2-sdk");
const baseTokens = require("./tokens.json");
const baseArray = ['WETH','USDT','WBTC','DAI'];  /// need to change based on token.js file
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
      `SELECT name as exchange_type,exchange_id FROM m_exchanges order by exchange_id asc limit 1`,
      async (err, result) => {
        if (err) throw err;
        exchanges = result;
        if (exchanges.length > 0) {
          for (let ex = 0; ex < exchanges.length; ex++) {
            new Promise(async (resolve, rejects) => {
              await con.query(
                `SELECT * FROM m_common_pair where exchange_id = '${exchanges[ex].exchange_id}' and pair_id in ('271') ORDER by pair_id ASC limit 1`,
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
                          decimal0: element.decimal0,
                          decimal1: element.decimal1,
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
    //  intervals[i] = setInterval(async () => {
        let allArbitrage = [];
        for (let e = 0; e < value.exchanges.length; e++) {

          
          let baseInfo = {
            pairId: value.exchanges[e].pairtoken.toString(),
            exchange: value.exchanges[e].name.toString(),
            token0: value.token0.toString(),
            token1: value.token1.toString(),
            decimal0: value.decimal0,
            decimal1: value.decimal1,
            symbol0:  value.symbol.split("/")[0],
            symbol1:  value.symbol.split("/")[1],
          }
          let otherExchanges = value.exchanges.filter(function(element){            
            return element.name !== value.exchanges[e].name;
        });
          let getExchangeInput = new Promise(async (resolve, reject) => {
           
  
            let staticPathArray = ['USDC'];
  
            let modifiedBaseArray = [];
  
            let usdcResult = await checkPairExist(staticPathArray[staticPathArray.length-1], baseInfo);
            if (usdcResult) {
            // if (0 > 1) {
              let pairTrade;
              let usdcInputCoins = ["1000000000", "5000000000", "10000000000"];
              let usdcInputDollars = ["$1000", "$5000", "$10000"];
              let baseOutput = [];
              let usdcReserve0 = usdcResult.usdcReserve0 
              let usdcReserve1 = usdcResult.usdcReserve1 
              let reserve0 = usdcResult.reserve0 
              let reserve1 = usdcResult.reserve1 
              
              
              if (baseInfo.exchange == "UNISWAP") {

                if(baseTokens[staticPathArray[staticPathArray.length-1]].token.toString() == baseInfo.token0.toString()){ // USDC -- USDC

                  let token0 = new uniSDK.Token(
                    1,
                    baseInfo.token0.toString(),
                    parseInt(baseInfo.decimal0)
                  );
                  let token1 = new uniSDK.Token(
                    1,
                    baseInfo.token1.toString(),
                    parseInt(baseInfo.decimal1)
                  );
      
                 
                  
                  let pair = await new uniSdkV2.Pair(
                    uniSDK.CurrencyAmount.fromRawAmount(
                      token0,
                      reserve0
                    ),
                    uniSDK.CurrencyAmount.fromRawAmount(
                      token1,
                      reserve1
                    )
                  );
                  for (let uCoin = 0; uCoin < usdcInputCoins.length; uCoin++) {
                   
                    pairTrade =  new uniSdkV2.Trade(
                      new uniSdkV2.Route([pair], token0, token1),
                      uniSDK.CurrencyAmount.fromRawAmount(token0, usdcInputCoins[uCoin]),
                      uniSDK.TradeType.EXACT_INPUT
                    );
    
                    baseOutput.push({
                      usdcInput: usdcInputCoins[uCoin],
                      otherExinputValue: pairTrade.outputAmount.toSignificant(6),
                      dollarWorth: usdcInputDollars[uCoin],
                    });
                  }

                } else {
                  
                  let token0 = new uniSDK.Token(
                    1,
                    baseInfo.token0.toString(),
                    parseInt(baseInfo.decimal0)
                  );
                  let token1 = new uniSDK.Token(
                    1,
                    baseInfo.token1.toString(),
                    parseInt(baseInfo.decimal1)
                  );
      
                  let USDC = new uniSDK.Token(
                    1,
                    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
                    6
                  );
                  
                  let usdcPair = await new uniSdkV2.Pair(
                    uniSDK.CurrencyAmount.fromRawAmount(
                      USDC,
                      usdcReserve0
                    ),
                    uniSDK.CurrencyAmount.fromRawAmount(
                      token0,
                      usdcReserve1
                    )
                  );
                  let pair = await new uniSdkV2.Pair(
                    uniSDK.CurrencyAmount.fromRawAmount(
                      token0,
                      reserve0
                    ),
                    uniSDK.CurrencyAmount.fromRawAmount(
                      token1,
                      reserve1
                    )
                  );
                  for (let uCoin = 0; uCoin < usdcInputCoins.length; uCoin++) {
                    let usdcTrade = new uniSdkV2.Trade(
                      new uniSdkV2.Route([usdcPair], USDC, token0),
                      uniSDK.CurrencyAmount.fromRawAmount(
                        USDC,
                        usdcInputCoins[uCoin]
                      ),
                      uniSDK.TradeType.EXACT_INPUT
                    );
    
                    let inputValue = (usdcTrade.outputAmount.toSignificant(6) * 10 ** parseInt(baseInfo.decimal0)).toFixed();
                    inputValue = Number(inputValue).toLocaleString().replace(/,/g,"");
                    pairTrade =  new uniSdkV2.Trade(
                      new uniSdkV2.Route([pair], token0, token1),
                      uniSDK.CurrencyAmount.fromRawAmount(token0, inputValue),
                      uniSDK.TradeType.EXACT_INPUT
                    );
    
                    baseOutput.push({
                      usdcInput: usdcTrade.outputAmount.toSignificant(6),
                      otherExinputValue: pairTrade.outputAmount.toSignificant(6),
                      dollarWorth: usdcInputDollars[uCoin],
                    });
                  }
                }
                
                
              } else if (baseInfo.exchange == "SUSHISWAP") {
                if(baseTokens[staticPathArray[staticPathArray.length-1]].token.toString() == baseInfo.token0.toString()){ // USDC -- USDC

                  let token0 = new sushiSdk.Token(
                    1,
                    Web3.utils.toChecksumAddress(baseInfo.token0.toString()),
                    parseInt(baseInfo.decimal0)
                  );
                  let token1 = new sushiSdk.Token(
                    1,
                    Web3.utils.toChecksumAddress(baseInfo.token1.toString()),
                    parseInt(baseInfo.decimal1)
                  );
              
                 
                  
                  let pair = await new sushiSdk.Pair(
                    sushiSdk.CurrencyAmount.fromRawAmount(
                      token0,
                      reserve0
                    ),
                    sushiSdk.CurrencyAmount.fromRawAmount(
                      token1,
                      reserve1
                    )
                  );
                  for (let uCoin = 0; uCoin < usdcInputCoins.length; uCoin++) {
                   
                    pairTrade =  new sushiSdk.Trade(
                      new sushiSdk.Route([pair], token0, token1),
                      sushiSdk.CurrencyAmount.fromRawAmount(token0, usdcInputCoins[uCoin]),
                      sushiSdk.TradeType.EXACT_INPUT
                    );
              
                    baseOutput.push({
                      usdcInput: usdcInputCoins[uCoin],
                      otherExinputValue: pairTrade.outputAmount.toSignificant(6),
                      dollarWorth: usdcInputDollars[uCoin],
                    });
                  }
              
                } else {
                  
                  let token0 = new sushiSdk.Token(
                    1,
                    Web3.utils.toChecksumAddress(baseInfo.token0.toString()),
                    parseInt(baseInfo.decimal0)
                  );
                  let token1 = new sushiSdk.Token(
                    1,
                    Web3.utils.toChecksumAddress(baseInfo.token1.toString()),
                    parseInt(baseInfo.decimal1)
                  );
              
                  let USDC = new sushiSdk.Token(
                    1,
                    Web3.utils.toChecksumAddress("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"),
                    6
                  );
                  
                  let usdcPair = await new sushiSdk.Pair(
                    sushiSdk.CurrencyAmount.fromRawAmount(
                      USDC,
                      usdcReserve0
                    ),
                    sushiSdk.CurrencyAmount.fromRawAmount(
                      token0,
                      usdcReserve1
                    )
                  );
                  let pair = await new sushiSdk.Pair(
                    sushiSdk.CurrencyAmount.fromRawAmount(
                      token0,
                      reserve0
                    ),
                    sushiSdk.CurrencyAmount.fromRawAmount(
                      token1,
                      reserve1
                    )
                  );
                  for (let uCoin = 0; uCoin < usdcInputCoins.length; uCoin++) {
                    let usdcTrade = new sushiSdk.Trade(
                      new sushiSdk.Route([usdcPair], USDC, token0),
                      sushiSdk.CurrencyAmount.fromRawAmount(
                        USDC,
                        usdcInputCoins[uCoin]
                      ),
                      sushiSdk.TradeType.EXACT_INPUT
                    );
              
                    let inputValue = (usdcTrade.outputAmount.toSignificant(6) * 10 ** parseInt(baseInfo.decimal0)).toFixed();
                    inputValue = Number(inputValue).toLocaleString().replace(/,/g,"");
                    pairTrade =  new sushiSdk.Trade(
                      new sushiSdk.Route([pair], token0, token1),
                      sushiSdk.CurrencyAmount.fromRawAmount(token0, inputValue),
                      sushiSdk.TradeType.EXACT_INPUT
                    );
              
                    baseOutput.push({
                      usdcInput: usdcTrade.outputAmount.toSignificant(6),
                      otherExinputValue: pairTrade.outputAmount.toSignificant(6),
                      dollarWorth: usdcInputDollars[uCoin],
                    });
                  }
                }
              }
              resolve(baseOutput);
  
            } else {
              modifiedBaseArray = await modifyBaseArray(baseArray, staticPathArray);
              let checkPairpath = await recFunction(staticPathArray, modifiedBaseArray,baseInfo);

            }
            

          })

          let uniswapInput = await getExchangeInput;
          console.log(uniswapInput);
            // let worthThourArbit = await checkOtherExchange(uniswapInput,otherExchanges,baseInfo.exchange,baseInfo.token0,baseInfo.token1);
            // allArbitrage.push(worthThourArbit);          
           
        }
      // }, 50000);
    };
    


      let modifyBaseArray = async (baseArray,staticPathArray) => {
        return new Promise(async(resolve,reject) => {
          
          let newLayerArr = []
          for(let i =0; i < baseArray.length; i++){
            let index = staticPathArray.indexOf(baseArray[i]);
            if(0 >= index){
               newLayerArr.push(baseArray[i])
            }
          }            
              
          resolve(newLayerArr);
        })
      }


    let checkPairExist = async (checkToken0,checkToken1) => {
      return new Promise(async(resolve,reject) => {
        
        let postData;
        if(baseTokens[checkToken0].token.toString() == checkToken1.token0.toString()){   // USDC == USDC 
  
           postData = {
            token0: baseTokens[checkToken0].token, //USDC
            token1: checkToken1.token1,
          };
        } else {
          postData = {
            token0: baseTokens[checkToken0].token, //USDC
            token1: checkToken1.token0,
          };
        }
  
        let configUsdc = {
          method: "POST",
          url: `http://localhost:5000/checkUsdc/${checkToken1.exchange}`,
          headers: {
            "Content-Type": "application/json",
          },
          data: postData,
        };
        axios(configUsdc).then(async (usdcResponse) => {
          if (usdcResponse.data.data) {
            let config = {
              method: "get",
              url: `http://localhost:5000/${checkToken1.exchange}/pair?pairAddress=${checkToken1.pairId}`, 
            };
            axios(config).then(async (pairResponse) => {
              if (pairResponse.data.data.pair) {
                let usdcReserve0;
                let usdcReserve1;
                if(usdcResponse.data.shuffle == 0){
                  usdcReserve0 = usdcResponse.data.data.pairs[0].reserve0
                  usdcReserve1 = usdcResponse.data.data.pairs[0].reserve1
                } else {
                  usdcReserve0 = usdcResponse.data.data.pairs[0].reserve1
                  usdcReserve1 = usdcResponse.data.data.pairs[0].reserve0
                }
                let reserve0 = pairResponse.data.data.pair.reserve0
                let reserve1 = pairResponse.data.data.pair.reserve1
  
                resolve({
                  "usdcReserve0":usdcReserve0, 
                  "usdcReserve1":usdcReserve1,
                  "reserve0":reserve0,
                  "reserve1":reserve1
                })
  
              } else {
                resolve()
              }
            })
          } else {
            resolve()
          }
        });
      })
    }

    let recFunction = async (staticPathArray, modifiedBaseArray,baseInfo) => {
      if(modifiedBaseArray.length == 0) return false;
      
      
      return new Promise(async(resolve,reject) => {
        
        let lastElement = staticPathArray[staticPathArray.length-1];
        let pairsAvailable = [];
        let pairsNotAvailable = [];

        for(let i = 0; i < modifiedBaseArray.length; i++){
          let matchedFlag;
          let iTokenFlag;          
             matchedFlag = await checkPairAvailability(lastElement,modifiedBaseArray[i],baseInfo,pairsAvailable,pairsNotAvailable)
              if(matchedFlag.status){
                if(matchedFlag.avaliablePush) {
                  pairsAvailable.push([lastElement,modifiedBaseArray[i]])
                }
                if(matchedFlag.notAvailablePush) {
                  pairsNotAvailable.push([lastElement,modifiedBaseArray[i]])
                }
                iTokenFlag = await checkPairAvailability(modifiedBaseArray[i], baseInfo.symbol0,baseInfo,pairsAvailable,pairsNotAvailable);
                if(iTokenFlag.avaliablePush) {
                  pairsAvailable.push([modifiedBaseArray[i],baseInfo.symbol0])
                }
                if(iTokenFlag.notAvailablePush) {
                  pairsNotAvailable.push([modifiedBaseArray[i],baseInfo.symbol0])
                }
              } 
          
          if(matchedFlag.status && iTokenFlag.status) {
              staticPathArray.push(modifiedBaseArray[i], baseInfo.token0)
              resolve(staticPathArray)
          }
      }

      for(let j = 0; j < modifiedBaseArray.length; j++){
        staticPathArray.push(modifiedBaseArray[j])
          let innerModifiedBaseArray = await modifyBaseArray(baseArray, staticPathArray)
         const resFn =  await recFunction(staticPathArray, innerModifiedBaseArray,baseInfo);
         if(resFn) {
             return true;
         }
    }



      })
    }

    let checkpairsAvailable =async(fromToken,toToken,pairsAvailable) => {
     return new Promise(async (resolve,reject)=> {

       if(pairsAvailable.length == 0){
         resolve(false)
       } else {
          for(let i =0; i < pairsAvailable.length; i++){
             let pairs = pairsAvailable[i];
             let checkFromToken = pairsAvailable[i].indexOf(fromToken)
             let checkToToken = pairsAvailable[i].indexOf(toToken)
             if(checkFromToken >= 0 && checkToToken >= 0){
               resolve(true)
             } else {
               if(i == pairsAvailable.length -1){
                 resolve(false)
               }
             }
          }
       }
     })

    }
    let checkpairsNotAvailable =async(fromToken,toToken,pairsNotAvailable) => {
      return new Promise(async (resolve,reject)=> {

        if(pairsNotAvailable.length == 0){
          resolve(false)
        } else {
          for(let i =0; i < pairsNotAvailable.length; i++){
            let pairs = pairsNotAvailable[i];
            let checkFromToken = pairsNotAvailable[i].indexOf(fromToken)
            let checkToToken = pairsNotAvailable[i].indexOf(toToken)
            if(checkFromToken >= 0 && checkToToken >= 0){
              resolve(true)
            } else {
              if(i == pairsNotAvailable.length -1){
                resolve(false)
              }
            }
         }
        }
      })

    }


    let checkPairAvailability = async (fromToken, toToken,baseInfo,pairsAvailable,pairsNotAvailable) => {
      return new Promise(async(resolve,reject)=>{
        let checkAvaliablePair = await checkpairsAvailable(fromToken, toToken,pairsAvailable);
        let checkNotAvaliablePair = await checkpairsNotAvailable(fromToken, toToken,pairsNotAvailable)
        if (checkAvaliablePair) {
           resolve({
             status: true,
             avaliablePush: false,
             notAvailablePush:false
           });
        } else if (checkNotAvaliablePair) {
          resolve({
            status: false,
            avaliablePush: false,
            notAvailablePush:false
          });
        } else {
          const res = await checkWithGraphAPI(fromToken, toToken,baseInfo);
          if (res) {

            resolve({
              status: true,
              avaliablePush: true,
              notAvailablePush:false
            });
          } else {
            resolve({
              status: false,
              avaliablePush: false,
              notAvailablePush:true
            });
          }
        }
      })
    };


    let checkWithGraphAPI = async (fromToken, toToken,baseInfo) => {
      return new Promise(async (resolve,reject)=> {
        
        let postData = {
          token0: baseTokens[fromToken].token.toString(), 
          token1: (baseTokens[toToken]) ? baseTokens[toToken].token : baseInfo.token0,
        };
  
        let configUsdc = {
          method: "POST",
          url: `http://localhost:5000/checkUsdc/${baseInfo.exchange}`,
          headers: {
            "Content-Type": "application/json",
          },
          data: postData,
        };
        axios(configUsdc).then(async (usdcResponse) => {
          if (usdcResponse.data.data){
            resolve(usdcResponse.data.data)
          } else {
            resolve()
          }
        });
      })
    };




    
     
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
