const { ethers } = require("ethers");

class EthContract {
  constructor(url, contractAddress, chainId, contractABI) {
    this.contractAddress = contractAddress;
    this.chainId = chainId;
    this.provider = new ethers.providers.JsonRpcProvider(url);
    this.contract = new ethers.Contract(
      contractAddress,
      contractABI,
      this.provider
    );
  }
  async contractInteractive(functionName, methodParams) {
    const transaction = await this.contract.populateTransaction[functionName](
      ...methodParams
    );
    return transaction;
  }

  async approve(amount, spender, userAddress) {
    const value = ethers.BigNumber.from((amount * Math.pow(10, 6)).toString());
    const methodParams = [spender, value];

    const functionName = "approve";
    const transaction = await this.contractInteractive(
      functionName,
      methodParams
    );
    transaction.to = this.contractAddress;
    transaction.from = userAddress;
    transaction.gasLimit = await this.estimateGas(transaction); // 输入 Gas 限制
    transaction.chainId = this.chainId;
    return transaction;
  }

  async estimateGas(result) {
    try {
      const transaction = {
        to: result.to,
        from: result.from,
        data: result.data,
      };
      const gasLimit = await this.provider.estimateGas(transaction);
      return gasLimit.toHexString();
    } catch (error) {
      return "0xdbc8";
    }
  }
}

module.exports = EthContract;
