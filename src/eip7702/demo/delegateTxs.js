const { ethers } = require("ethers");

const contractABI = [
  "function execute((address,uint256,bytes)[] calls) external payable",
  "function execute((address,uint256,bytes)[] calls, bytes signature) external payable",
  "function nonce() external view returns (uint256)",
];

const config = require("../config");
const provider = new ethers.JsonRpcProvider(config.provider);

async function createAuthorization(nonce, delegation) {
  const auth = await gasPayer.authorize({
    address: delegation,
    nonce: nonce,
    chainId: config.chainId,
  });

  console.log("使用以下 nonce 创建授权：", auth.nonce);
  return auth;
}

async function sendDelegationTxs(gasPayer, delegation, calls) {
  const transaction = {
    to: gasPayer.address, // EIP-7702 合约地址
    from: gasPayer.address,
    type: 2,
  };

  // 如果合约地址没有代码，则使用 EIP-7702 授权列表
  const code = await provider.getCode(gasPayer.address);
  if (code === "0x") {
    transaction.type = 4;
    transaction.authorizationList = [
      await createAuthorization(
        (await provider.getTransactionCount(gasPayer.address)) + 1,
        delegation
      ),
    ];
  }

  transaction.maxFeePerGas = ethers.parseUnits("2", "gwei"); // 增加 gas 价格
  transaction.maxPriorityFeePerGas = ethers.parseUnits("1.5", "gwei");
  transaction.nonce = await provider.getTransactionCount(gasPayer.address); // 使用正确的地址获取 nonce
  transaction.chainId = config.chainId;
  transaction.gasLimit = 500000;

  // 创建合约实例并执行
  const delegatedContract = new ethers.Contract(
    gasPayer.address,
    contractABI,
    gasPayer
  );

  const txData = delegatedContract.interface.encodeFunctionData(
    "execute((address,uint256,bytes)[])",
    [calls]
  );

  transaction.data = txData;
  const signedTransaction = await gasPayer.signTransaction(transaction);
  const tx = ethers.Transaction.from(signedTransaction);

  const transactionResponse = await gasPayer.sendTransaction(tx);
  console.log("Transaction sent:", transactionResponse.hash);

  const receipt = await transactionResponse.wait();
  console.log("Transaction receipt:", receipt);
}

function batchApprove() {
  const approveList = [
    {
      tokenAddress: "0xb712B85700931EB2De4BD66E65Ef2F0e74a7B364", // usdc
      contractAddress: "0xAec1F48e02Cfb822Be958B68C7957156EB3F0b6e",
      unit: 6,
    },
    {
      tokenAddress: "0xb41328103Cb91BE18E2aCEf88df03eA59ADa75e5",  // ip
      contractAddress: "0x000000000022D473030F116dDEE9F6B43aC78BA3",
      unit: 6,
    },
  ];

  const erc20Abi = require("../data/approveAbi.json");

  // 批量取消授权
  const calls = [];
  for (const token of approveList) {
    const erc20 = new ethers.Contract(token.tokenAddress, erc20Abi, provider);
    const value = ethers.parseUnits("0", token.unit);
    const txData = erc20.interface.encodeFunctionData("approve", [
      token.contractAddress,
      value,
    ]);
    calls.push([token.tokenAddress, value, txData]);
  }
  return calls;
}

function batchTransferCoin() {
  return [
    // to address, value, data\
    [ethers.ZeroAddress, ethers.parseEther("0.001"), "0x"],
    [gasPayer.address, ethers.parseEther("0.002"), "0x"],
  ];
}

function batchTransferToken(address) {
  const tokens = [
    {
      tokenAddress: "0xb712B85700931EB2De4BD66E65Ef2F0e74a7B364",
      unit: 6,
    }
    // {
    //   tokenAddress: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
    //   unit: 18,
    // },
  ];

  const erc20Abi = [
    "function transfer(address to, uint256 amount) external returns (bool)",
  ];
  const calls = [];
  for (const token of tokens) {
    const erc20 = new ethers.Contract(token.tokenAddress, erc20Abi, provider);
    const value = ethers.parseUnits("0.1", token.unit);
    const txData = erc20.interface.encodeFunctionData("transfer", [
      address,
      value,
    ]);
    calls.push([token.tokenAddress, value, txData]);
  }
  return calls;
}

module.exports = {
  batchApprove,
  batchTransferCoin,
  batchTransferToken,
  sendDelegationTxs,
};
