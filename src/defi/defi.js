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
    this.provider = new ethers.providers.JsonRpcProvider(
      options.rpcProvider ?? options.url
    );
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
    const value = this.parseUnits(amount);
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
    return this.fulfillTransaction(userAddress, transaction);
  }

  async deposit(amount, userAddress) {
    const value = this.parseUnits(amount);
    const methodParams = this.loadMethodParams(
      value,
      userAddress,
      this.depositConfig.methodParams
    );
    const transaction = await this.defiContract.contractInteractive(
      this.depositConfig.functionName,
      methodParams
    );
    return this.fulfillTransaction(userAddress, transaction);
  }

  async withdraw(amount, userAddress) {
    const value = this.parseUnits(amount);
    const methodParams = this.loadMethodParams(
      value,
      userAddress,
      this.withdrawConfig.methodParams
    );
    const transaction = await this.defiContract.contractInteractive(
      this.withdrawConfig.functionName,
      methodParams
    );
    return this.fulfillTransaction(userAddress, transaction);
  }

  parseUnits(amount) {
    return ethers.BigNumber.from((amount * Math.pow(10, this.unit)).toString());
  }

  async fulfillTransaction(userAddress, transaction) {
    transaction.from = userAddress;
    transaction.gasLimit = await EthContract.estimateGas(
      transaction,
      this.provider
    ); // 输入 Gas 限制
    transaction.chainId = this.chainId;
    return transaction;
  }

  loadMethodParams(value, userAddress, params) {
    const data = {
      tokenAddress: this.tokenAddress,
      contractAddress: this.contractAddress,
      amount: value,
      userAddress,
    };
    const methodParams = [];
    for (const param of params) {
      methodParams.push(data[param]);
    }
    return methodParams;
  }
}

module.exports = Defi;
