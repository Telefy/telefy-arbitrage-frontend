require("dotenv").config({});
const Web3 = require("web3");
const Provider = require('@truffle/hdwallet-provider');
const provider = new Provider(process.env.WALLET_PRIVATE_KEY, process.env.HTTP_URL); 
// loading env vars
const HTTP_URL = process.env.HTTP_URL;
const WSS_URL = process.env.WSS_URL;

const web3http = new Web3(provider);
const web3ws = new Web3(new Web3.providers.WebsocketProvider(WSS_URL));

module.exports = { web3http, web3ws };