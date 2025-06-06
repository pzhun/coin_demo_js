const config = require("./config");
const { ethers } = require("ethers");
const { setAuth } = require("./demo/setAuth");
const {
  batchApprove,
  batchTransferCoin,
  batchTransferToken,
  sendDelegationTxs,
} = require("./demo/delegateTxs");

const provider = new ethers.JsonRpcProvider(config.provider);
const gasPayer = new ethers.Wallet(config.privateKey, provider);
const newWallet = new ethers.Wallet(config.newPrivateKey, provider);

async function main() {
  // // 给新用户授权
  // await setAuth(gasPayer, newWallet, config.testDelegation);
  // // 给自己钱包授权
  // await setAuth(gasPayer, gasPayer, config.testDelegation);
  // 取消授权
  // await setAuth(gasPayer, gasPayer, config.zeroAddress);
  // 批量授权
  // const calls = batchApprove(newWallet.address);
  // await sendDelegationTxs(gasPayer, config.testDelegation, calls);
}

main();
