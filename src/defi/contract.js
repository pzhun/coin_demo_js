const { ethers } = require("ethers");

class EthContract {
  constructor(options) {
    this.contractAddress = options.contractAddress;
    this.chainId = options.chainId;
    this.provider = new ethers.providers.JsonRpcProvider(options.url);
    this.contract = new ethers.Contract(
      this.contractAddress,
      options.contractABI,
      this.provider
    );
  }
  async contractInteractive(functionName, methodParams) {
    const transaction = await this.contract.populateTransaction[functionName](
      ...methodParams
    );
    return transaction;
  }

  static async estimateGas(result, provider) {
    try {
      const transaction = {
        to: result.to,
        from: result.from,
        data: result.data,
      };
      const gasLimit = await provider.estimateGas(transaction);
      return gasLimit.toHexString();
    } catch (error) {
      console.log(error);
      return "0x0172a3";
    }
  }
}

module.exports = EthContract;
