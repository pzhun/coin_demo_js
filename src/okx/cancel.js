const okx = require("./okx");
const ethers = require("ethers");

async function main() {
  let orderData;
  try {
    const hash =
      "0xe0d1f2fb8c9ad14d0744081e0d3c7a337bcee78107eb8628a14639132a07a9d1";
    const resp = await okx.cancelLimitOrder(hash);
    orderData = resp.data.data;
    console.log(orderData);
  } catch (error) {
    console.log(error);
  }
  /// dart部分
  const provider = new ethers.providers.JsonRpcProvider(
    "https://opt-mainnet.g.alchemy.com/v2/1wvoK3MtpX3HTfeLjZgH7Cr-NpDvTBWI"
  );
  const privateKey = "privateKey";
  const wallet = new ethers.Wallet(privateKey, provider);
  console.log(orderData);
  const contractAddress = "0x2ae8947FB81f0AAd5955Baeff9Dcc7779A3e49F2";
  const txObject = {
    to: contractAddress,
    data: orderData,
  };

  const result = await wallet.sendTransaction(txObject);
  console.log(result);
}

main();
