const EthContract = require("./contract");
const { ethers } = require("ethers");

class Defi {
  constructor(options) {
    this.depositConfig = options.depositConfig;
    this.withdrawConfig = options.withdrawConfig;
    this.unit = options.unit;
    this.erc20ABI = options.erc20ABI;
    this.tokenAddress = options.tokenAddress;
    this.contractAddress = options.contractAddress;
    this.provider = new ethers.providers.JsonRpcProvider(options.url);
    this.chainId = options.chainId;
    // 合约对象
    this.defiContract = new EthContract({
      url: options.url,
      contractAddress: this.contractAddress,
      chainId: this.chainId,
      contractABI: options.contractABI,
    });
  }

  async approve(amount, userAddress) {
    const value = ethers.BigNumber.from(
      (amount * Math.pow(10, this.unit)).toString()
    );
    const methodParams = [this.contractAddress, value];
    const erc20 = new ethers.Contract(
      this.tokenAddress,
      this.erc20ABI,
      this.provider
    );
    const transaction = await erc20.populateTransaction.approve(
      ...methodParams
    );
    transaction.to = this.tokenAddress;
    transaction.from = userAddress;
    transaction.gasLimit = await EthContract.estimateGas(
      transaction,
      this.provider
    ); // 输入 Gas 限制
    transaction.chainId = this.chainId;
    return transaction;
  }

  async deposit(amount, userAddress) {
    const value = ethers.BigNumber.from(
      (amount * Math.pow(10, this.unit)).toString()
    );
    console.log(value);
    const data = {
      tokenAddress: this.tokenAddress,
      contractAddress: this.contractAddress,
      amount: value,
      userAddress,
    };
    const methodParams = [];
    for (const param of this.depositConfig.methodParams) {
      methodParams.push(data[param]);
    }
    console.log(methodParams);
    const transaction = await this.defiContract.contractInteractive(
      this.depositConfig.functionName,
      methodParams
    );
    transaction.to = this.contractAddress;
    transaction.from = userAddress;
    transaction.gasLimit = await EthContract.estimateGas(
      transaction,
      this.provider
    ); // 输入 Gas 限制
    transaction.chainId = this.chainId;
    return transaction;
  }

  async withdraw() {}
}

module.exports = Defi;
