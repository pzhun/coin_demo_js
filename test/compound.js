const { ethers } = require("ethers");
const EthContract = require("../src/defi/contract");
const { sendTransaction } = require("../src/eth/send");
const Compound = require("@compound-finance/compound-js"); // in Node.js
const rpcProvider = "https://rpc-sepolia.rockx.com";
const chainId = 11155111;
const userAddress = "0x642274bc94f720a3107992e630269f79b931c73d";
const privateKey = "";
// 创建一个 Provider，用于连接以太坊网络
const provider = new ethers.providers.JsonRpcProvider(rpcProvider);
const wallet = new ethers.Wallet(privateKey, provider);

// 合约地址
const contractAddress = "0xAec1F48e02Cfb822Be958B68C7957156EB3F0b6e"; // 资产地址
const tokenAddress = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"; // 合约地址
// 合约 ABI
const contractABI = Compound.util.getAbi("Comet"); // 通过各种方式获取
const erc20ABI = Compound.util.getAbi("Erc20");

async function approve() {
  const erc20 = new EthContract(rpcProvider, tokenAddress, erc20ABI);
  const transaction = erc20.approve(1000, contractAddress, userAddress);
  const result = await sendTransaction(wallet, transaction, provider);
  console.log(result);
}

async function supply() {
  const from = me;
  const dst = me;
  const amountRaw = 0.01;
  const amount = amountRaw * Math.pow(10, 6);

  const methodParams = [
    from,
    dst,
    assetAddress,
    ethers.BigNumber.from(amount.toString()),
  ];

  const compound = new EthContract(rpcProvider, contractAddress, contractABI);
  const functionName = "supplyFrom";
  const transaction = await compound.contractInteractive(
    functionName,
    methodParams
  );
  transaction.from = userAddress;
  transaction.gasLimit = await compound.estimateGas(transaction); // 输入 Gas 限制

  transaction.chainId = chainId;
  const result = await sendTransaction(wallet, transaction, provider);
  console.log(result);
}

supply();
