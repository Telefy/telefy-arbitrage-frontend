const Big = require("big.js");
const blk = require("./blockchain");
var sushiApi = require("sushiswap-api");
const axios = require("axios");
const express = require("express");
const app = express();
const path = require("path");
const router = express.Router();
const mysql = require("mysql");
const { clear } = require("console");
const { clearInterval } = require("timers");
const server = require("http").createServer(app);
const io = require("socket.io")(server);

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
let checkEvent = false;
let interval0 = {};
let interval1 = {};
//**********************************    LOGIN SOCKET ********************************//
io.use(async (socket, next) => {
  //  next()
  if (socket.handshake.query && socket.handshake.query.client) {
    table = [];
    await con.query(
      `SELECT * FROM m_common_pair where exchange_type = 'UNISWAP' ORDER by pair_id DESC limit 100`,
      async (err, result) => {
        if (err) throw err;
        result.forEach((element) => {
          table.push({
            symbol: element.symbol,
            token0: element.token0,
            token1: element.token1,
            amt_in_token: element.amt_in_token,
            exchanges: [
              {
                name: "uniswap",
                pairtoken: element.pairtoken,
                price0: "",
                price1: "",
              },
            ],
          });
        });
        if (result.length == table.length) {
          await con.query(
            `SELECT * FROM m_common_pair where exchange_type = 'SUSHISWAP' ORDER by pair_id DESC limit 100`,
            function (err, result) {
              if (err) throw err;
              let i = 0;
              result.forEach((element) => {
                var getIndex = table.findIndex(
                  (pair) =>
                    pair.token0 === element.token0 &&
                    pair.token1 === element.token1
                );
                table[getIndex].exchanges.push({
                  name: "sushiswap",
                  pairtoken: element.pairtoken,
                  price0: "",
                  price1: "",
                });

                i++;
              });
              if (result.length == i) {
                next();
              }
            }
          );
        }
      }
    );
  }
}).on("connection", function (socket) {
  if (!checkEvent) {
    var setCB = function (value, i) {

      interval0[i] = setInterval(async () => {
        let pariAddr = value.exchanges[0].pairtoken.toString();
        try {
          var data = "";

          var config = {
            method: "get",
            url: `http://localhost:5000/uniswap-price?pairAddress=${pariAddr}`,
            headers: {
              "Content-Type": "application/json",
            },
            data: data,
          };

          axios(config)
            .then(function (response) {
              if (response.data.data.pair) {
                response.data.data.pair.amount = value.amt_in_token;
                response.data.data.pair.sushipairId =
                  value.exchanges[1].pairtoken;
                io.sockets.emit(
                  value.exchanges[0].pairtoken,
                  response.data.data.pair
                );
              }
            })
            .catch(function (error) {
              console.log(error, "--axios error uniswap");
            });
        } catch (error) {
          console.error(error, "=---uniswap error");
        }
      }, 10000);

      interval1[i] = setInterval(async () => {
        let pariAddr1 = value.exchanges[1].pairtoken.toString();
        try {
          var data = "";

          var config = {
            method: "get",
            url: `http://localhost:5000/sushiswap-price?pairAddress=${pariAddr1}`,
            headers: {
              "Content-Type": "application/json",
            },
            data: data,
          };

          axios(config)
            .then(function (response) {
              if (response.data.data.pair) {
                response.data.data.pair.amount = value.amt_in_token;
                response.data.data.pair.unipairId =
                  value.exchanges[0].pairtoken;
                io.sockets.emit(
                  value.exchanges[1].pairtoken,
                  response.data.data.pair
                );
              }
            })
            .catch(function (error) {
              console.log(error, "--axios error sushiswap");
            });
        } catch (error) {
          console.error(error, "=---sushiswap error");
        }
      }, 10000);
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
server.listen(process.env.port || 3000);
