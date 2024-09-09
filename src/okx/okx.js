const axios = require("axios");
const cryptoJS = require("crypto-js");

const okx = {
  host: "https://www.okx.com",
  secretKey: "2C16814F1B3BAEA01F1B38147683D8DE",
  apiKey: "47c3d2ce-4867-4f8b-ac2f-a3ed83af1330",
  passphrase: "Zaq123456.",
};

const { host, secretKey, apiKey, passphrase } = okx;

const Decimal = require("decimal.js");

// Build domain data
const domainData = {
  name: "OKX LIMIT ORDER",
  version: "2.0",
  chainId: 10, // The chainId of the ETH mainnet
  verifyingContract: "0x2ae8947FB81f0AAd5955Baeff9Dcc7779A3e49F2", // LimitOrder contract address
};

const toSatoshis = (num, unit) => {
  const x = new Decimal((num / 1).toFixed(unit));
  const y = new Decimal(Math.pow(10, unit));
  return x.mul(y).toNumber();
};

// Define the limit order type
const Order = [
  { name: "salt", type: "uint256" },
  { name: "makerToken", type: "address" },
  { name: "takerToken", type: "address" },
  { name: "maker", type: "address" },
  { name: "receiver", type: "address" },
  { name: "allowedSender", type: "address" },
  { name: "makingAmount", type: "uint256" },
  { name: "takingAmount", type: "uint256" },
  { name: "minReturn", type: "uint256" },
  { name: "deadLine", type: "uint256" },
  { name: "partiallyAble", type: "bool" },
];

const getHeadersParams = (method, url, body) => {
  const timestamp = new Date().toISOString();
  return {
    "Content-Type": "application/json",
    "OK-ACCESS-KEY": apiKey,
    "OK-ACCESS-SIGN": cryptoJS.enc.Base64.stringify(
      cryptoJS.HmacSHA256(
        body
          ? timestamp + method + url + JSON.stringify(body)
          : timestamp + method + url,
        secretKey
      )
    ),
    "OK-ACCESS-TIMESTAMP": timestamp,
    "OK-ACCESS-PASSPHRASE": passphrase,
  };
};
let axs;
if (host) {
  axs = axios.create({
    baseURL: host,
  });
}
const handleRequest = async (config) => {
  if (!axs) {
    console.error("Axios instance is not initialized");
    return;
  }

  try {
    const response = await axs(config);
    return response;
  } catch (error) {
    // console.error("Request failed", error.data);
    throw error;
  }
};

module.exports = {
  getLimitOrderChainList: async () => {
    const method = "GET";
    const url = "/api/v5/dex/aggregator/limit-order/chain";
    const config = {
      headers: getHeadersParams(method, url),
      method,
      url,
    };
    return handleRequest(config);
  },

  getLimitOrderList: async (query) => {
    const method = "GET";
    let url = `/api/v5/dex/aggregator/limit-order/all?chainId=${query.chainId}&makerAsset=${query.makerAsset}`;
    console.log(getHeadersParams(method, url));
    const config = {
      headers: getHeadersParams(method, url),
      method,
      url,
    };
    return handleRequest(config);
  },

  getAllLimitOrderList: async (query) => {
    const method = "GET";
    let url = `/api/v5/dex/aggregator/limit-order/all?chainId=${query.chainId}`;
    console.log(getHeadersParams(method, url));
    const config = {
      headers: getHeadersParams(method, url),
      method,
      url,
    };
    return handleRequest(config);
  },

  createLimitOrder: async (body) => {
    const method = "POST";
    let url = `/api/v5/dex/aggregator/limit-order/save-order`;
    const config = {
      headers: getHeadersParams(method, url, body),
      method,
      url,
      data: body,
    };
    return handleRequest(config);
  },

  cancelLimitOrder: async (orderHash) => {
    const method = "GET";
    let url = `/api/v5/dex/aggregator/limit-order/cancel/calldata?orderHash=${orderHash}`;
    const config = {
      headers: getHeadersParams(method, url),
      method,
      url,
    };
    return handleRequest(config);
  },

  getLimitOrderCreateMessage: async () => {
    const { makerToken, takerToken, expireTime, chainId } = {
      takerToken: {
        address: "0x4200000000000000000000000000000000000042",
        unit: 18,
        amount: 1,
      },
      makerToken: {
        address: "0x0b2c639c533813f4aa9d7837caf62653d097ff85",
        unit: 6,
        amount: 1.32,
      },
      expireTime: 60 * 60 * 12,
      chainId: 10,
    };
    const makingAmount = String(toSatoshis(makerToken.amount, makerToken.unit));
    const takingAmount = String(toSatoshis(takerToken.amount, takerToken.unit));
    const minReturn = String(takingAmount * (1 - 0.5 * 0.01));
    const userAddress = "0x23ab32843d51fd619464d5D4216d27F2b37e9110";
    const orderData = {
      salt: String(Math.ceil(new Date().getTime() / 1000)),
      makerToken: makerToken.address,
      takerToken: takerToken.address,
      maker: userAddress,
      receiver: userAddress,
      allowedSender: "0x0000000000000000000000000000000000000000", // 默认所有地址都可成交
      makingAmount,
      takingAmount,
      minReturn,
      deadLine: String(Math.ceil(new Date().getTime() / 1000) + expireTime),
      partiallyAble: true,
    };

    // const orderData = {
    //   salt: String(Math.ceil(new Date().getTime() / 1000)),
    //   makerToken: "0x4200000000000000000000000000000000000042",
    //   takerToken: "0x0b2c639c533813f4aa9d7837caf62653d097ff85",
    //   maker: "0x23ab32843d51fd619464d5D4216d27F2b37e9110",
    //   receiver: "0x23ab32843d51fd619464d5D4216d27F2b37e9110",
    //   allowedSender: "0x0000000000000000000000000000000000000000",
    //   makingAmount: String(toSatoshis(0.1, 18)),
    //   takingAmount: String(toSatoshis(0.183, 6)),
    //   minReturn: String(toSatoshis(0.01, 6)),
    //   deadLine: String(Math.ceil(new Date().getTime() / 1000) + 1 * 60 * 60),
    //   partiallyAble: true,
    // };

    // Build EIP-712 messages
    const message = {
      domain: domainData,
      types: { Order },
      value: orderData,
    };

    return message;
  },
};
