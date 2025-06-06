const { ethers } = require("ethers");
const RLP = require("rlp");
const config = require("../config");

const EIP7702 = {
  MAGIC: "0x05",
  TX_TYPE: 4,
};

const provider = new ethers.JsonRpcProvider(config.provider);

function bytesToHex(bytes) {
  return "0x" + ethers.hexlify(bytes).slice(2);
}

/**
 *
 * @param {Wallet} gasPayer   付gas的钱包
 * @param {Wallet} signer     需要授权的钱包
 * @param {string} delegation 授权的合约地址
 */
async function setAuth(gasPayer, signer, delegation) {
  const transaction = {
    to: gasPayer.address,
    from: gasPayer.address,
  };
  transaction.gasLimit = 90000;
  transaction.maxFeePerGas = ethers.parseUnits("1.5", "gwei");
  transaction.maxPriorityFeePerGas = ethers.parseUnits("0.1", "gwei");

  // 区别：wallet.getTransactionCount() 和 provider.getTransactionCount()
  transaction.nonce = await provider.getTransactionCount(gasPayer.address); // 获取当前 nonce 值
  transaction.chainId = config.chainId;
  transaction.type = EIP7702.TX_TYPE;

  const auth = await getAuth(
    transaction.chainId,
    delegation,
    signer,
    gasPayer.address
  );

  transaction.authorizationList = [auth];
  const signedTransaction = await gasPayer.signTransaction(transaction);
  const tx = ethers.Transaction.from(signedTransaction);

  try {
    const transactionResponse = await gasPayer.sendTransaction(tx);
    // 监听交易状态
    const receipt = await transactionResponse.wait();
    console.log(receipt);
  } catch (error) {
    console.log(error);
  }
}

async function getAuth(chainId, address, wallet, gasPayer) {
  let nonce = await provider.getTransactionCount(wallet.address);
  // 获取nonce, 如果签名者与付gas的地址相同，则nonce增加1
  if (wallet.address === gasPayer) nonce++;

  // 1. RLP 编码 [chainId, address, nonce]
  const items = [
    ethers.toBeHex(chainId), // chainId 转为 bytes32
    address.toLowerCase(), // 地址转为小写
    ethers.toBeHex(nonce), // nonce 转为 bytes32
  ];
  // 新钱包授权时，nonce 为 0，需要设置为空
  if (nonce === 0) items[2] = "0x";

  const rlpEncoded = RLP.encode(items);
  // 2. 添加 0x05 前缀（EIP-191 结构化数据）
  const prefix = EIP7702.MAGIC;
  const prefixedData = ethers.concat([prefix, rlpEncoded]);

  // 3. 计算 keccak256 哈希
  const hash = ethers.keccak256(prefixedData);

  // 4. 使用私钥签名哈希（不自动添加 Ethereum 前缀）
  // const wallet = new ethers.Wallet(privateKey);
  const flatSig = wallet.signingKey.sign(hash);
  const { r, s, v } = flatSig;

  return {
    address: address,
    chainId: chainId,
    nonce: nonce,
    signature: {
      r: bytesToHex(r),
      s: bytesToHex(s),
      v: v,
    },
  };
}

module.exports = {
  setAuth,
};
