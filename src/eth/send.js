const { ethers } = require("ethers");

async function sendTransaction(wallet, transaction, provider) {
  transaction.nonce = await wallet.getTransactionCount(); // 获取当前 nonce 值
  transaction.maxFeePerGas = ethers.utils.parseUnits("100", "gwei"); // 输入最高费用
  transaction.maxPriorityFeePerGas = ethers.utils.parseUnits("1.5", "gwei"); // 输入优先费用
  transaction.type = 2;
  const signedTransaction = await wallet.signTransaction(transaction);
  const transactionResponse = await provider.sendTransaction(signedTransaction);
  return transactionResponse;
}

module.exports = {
  sendTransaction,
};
