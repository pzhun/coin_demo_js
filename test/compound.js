const { ethers } = require("ethers");
const { sendTransaction } = require("../src/eth/send");
const Compound = require("@compound-finance/compound-js"); // in Node.js
const Defi = require("../src/defi/defi");
const rpcProvider = "https://rpc-sepolia.rockx.com";

const privateKey = "";
// 创建一个 Provider，用于连接以太坊网络
const provider = new ethers.providers.JsonRpcProvider(rpcProvider);
const wallet = new ethers.Wallet(privateKey, provider);

// 获取或上传相关abi
const contractABI = Compound.util.getAbi("Comet");
const erc20ABI = Compound.util.getAbi("Erc20");

// 已有数据，包括token地址，合约地址，相关ABI,用户地址，小数位，
const config = {
  rpcProvider: "https://rpc-sepolia.rockx.com",
  tokenAddress: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
  unit: 6,
  erc20ABI,
  contractAddress: "0xAec1F48e02Cfb822Be958B68C7957156EB3F0b6e",
  contractABI,
  chainId: 11155111,
  depositConfig: {
    functionName: "supplyFrom",
    methodParams: ["userAddress", "userAddress", "tokenAddress", "amount"],
  }, // 映射数据用
  withdrawConfig: {
    functionName: "withdrawFrom",
    methodParams: ["userAddress", "userAddress", "tokenAddress", "amount"],
  },
};
// 前端输入
const input = {
  userAddress: "0x642274bc94f720a3107992e630269f79b931c73d",
  amount: 0.01,
};

const defi = new Defi(config); // 构建交互类

async function approve() {
  const transaction = await defi.approve(input.amount, input.userAddress);
  const result = await sendTransaction(wallet, transaction, provider);
  console.log(result);
}

async function supply() {
  const transaction = await defi.deposit(input.amount, input.userAddress);
  const result = await sendTransaction(wallet, transaction, provider);
  console.log(result);
}

supply();
