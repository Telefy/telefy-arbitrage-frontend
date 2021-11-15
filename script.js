const Big = require("big.js");
const blk = require("./blockchain");
var sushiApi	= require('sushiswap-api');
const axios = require("axios");
// const express = require('express');
// const app = express();
// const path = require('path');
// const router = express.Router();
const mysql = require('mysql');


var con = mysql.createConnection({
  host: "testdev.rungila.com",
  user: "user1",
  password: "_kVvPeE(S!#[XE_85@",
  database: "arbitrage",
});


con.connect(function (err) {
  if (err) throw err;
   console.log("Connected!");
//   con.query(`CREATE TABLE IF NOT EXISTS zohooauth.oauthtokens ( useridentifier varchar(100) NOT NULL, accesstoken varchar(500) NOT NULL, refreshtoken varchar(500) NOT NULL, expirytime bigint(100) NOT NULL ) ENGINE=InnoDB DEFAULT CHARSET=latin1`, function (err, result) {
//     if (err) throw err;
//     console.log("Database created");
// });
});


const checkUniswapPair = async (wheres,resolve,reject) => {
    console.log("---2")
    // console.log("\n")   
    try{
        let result = await axios.post(
            "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2",
            {
              query: `
              {
                  pairs(where :{
                    token0: "${wheres.token0}",
                    token1: "${wheres.token1}",
                    reserveUSD_gt: "100000", 
                    volumeUSD_gt: "5000"
                  }) {
                    id
                    token0 {
                      id
                      symbol
                    }
                    token1 {
                      id
                      symbol
                    }
                  }
                }
            `,
            }
          );
           console.log(result.data.data,"----")
          if(result.data.data.pairs.length > 0){
              let symbol0 = `${result.data.data.pairs[0].token0.symbol}/${result.data.data.pairs[0].token1.symbol}`
              let symbol1 = `${wheres.token0Sys}/${wheres.token1Sys}`
            var post = `('${symbol0}','UNISWAP','${result.data.data.pairs[0].id}','${result.data.data.pairs[0].token0.id}','${result.data.data.pairs[0].token1.id}','${wheres.amtInToken}'),('${symbol1}','SUSHISWAP','${wheres.pairAddr}','${wheres.token0}','${wheres.token1}','${wheres.amtInToken}')`;
        var sql = `INSERT INTO m_common_pair (symbol,exchange_type,pairtoken,token0,token1,amt_in_token) values ${post} `;
        console.log(sql,"---query")
              con.query(sql,post, function (err, res) {
                    if (err) throw err;                    
                    resolve(0)
                });
          } else {
            let result1 = await axios.post(
              "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2",
              {
                query: `
                {
                    pairs(where :{
                      token1: "${wheres.token0}",
                      token0: "${wheres.token1}",
                      reserveUSD_gt: "100000", 
                      volumeUSD_gt: "5000"
                    }) {
                      id
                      token0 {
                        id
                        symbol
                      }
                      token1 {
                        id
                        symbol
                      }
                    }
                  }
              `,
              }
            );
             console.log(result1.data.data,"--yyyyy--")
            // console.log(wheres,"---tokens")
            if(result1.data.data.pairs.length > 0){
              let symbol0 = `${result1.data.data.pairs[0].token0.symbol}/${result1.data.data.pairs[0].token1.symbol}`
              let symbol1 = `${wheres.token0Sys}/${wheres.token1Sys}`
              var post = `('${symbol0}','UNISWAP','${result1.data.data.pairs[0].id}','${result1.data.data.pairs[0].token0.id}','${result.data.data.pairs[0].token1.id}','${wheres.amtInToken}'),('${symbol1}','SUSHISWAP','${wheres.pairAddr}','${wheres.token0}','${wheres.token1}','${wheres.amtInToken}')`;
              var sql = `INSERT INTO m_common_pair (symbol,exchange_type,pairtoken,token0,token1,amt_in_token) values ${post} `;
               console.log(sql,"---query skiped ----")
              con.query(sql,post, function (err, res) {
                    if (err) throw err;                    
                    resolve(0)
                });
          } else {
            resolve(0)
          }

          }
    } catch(err) {
        console.log(wheres)
        console.log(err)
        resolve(0)
    }            
            
    }

let allPromise = []
const sushiswapLogic = async () => {
      try {
        let result = await axios.post(
          "https://api.thegraph.com/subgraphs/name/sushiswap/exchange",
          {
            query: `
              {
                pairs(first: 1000, 
                  where: {
                    reserveUSD_gt: "100000", 
                    volumeUSD_gt: "5000",
                    token0_not_in: ["0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2","0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"],
                    token1_not_in: ["0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2","0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"]                    
                  }, 
                  orderBy: reserveUSD, 
                  orderDirection: desc) {
                  id
                  token0 {
                    id
                    symbol
                  }
                  token1 {
                    id
                    symbol
                  }
                }
              }          
            `,
          }
        );
        if (result.data.data.pairs.length > 0) {
          result.data.data.pairs.forEach(function (pair) {
            console.log("---1")
            let wherevalues = {
              token0: pair.token0.id,
              token1: pair.token1.id,
              token0Sys: pair.token0.symbol,
              token1Sys: pair.token1.symbol,
              pairAddr: pair.id,
              amtInToken:0
            };
            
            allPromise.push(new Promise(async (resolve, reject) => await checkUniswapPair(wherevalues, resolve, reject)));
          });
        }
      } catch (err) {
        console.log(wheres);
        console.log(err);
        reject(0);
      }

  }

  const start = async () => {
      await sushiswapLogic()
      Promise.all(allPromise).then((values) => {
        res.json(values,"--completed")
      });
      
  }
  start();




