const okx = require("./okx");
const ethers = require("ethers");

// Create an Ethereum signature wallet
const privateKey = "privateKey";
const userAddress = "address";
const wallet = new ethers.Wallet(privateKey);

async function main() {
  const message = await okx.getLimitOrderCreateMessage();
  /// /limit/order/param 该接口给的 body参数如下
  /**
    {
      "makerToken": "0x4200000000000000000000000000000000000042",
      "takerToken": "0x0b2c639c533813f4aa9d7837caf62653d097ff85",
      "makingAmount": "100000000000000000",
      "takingAmount": "183000",
      "expireTime": 3600,
      "chainId": 10
    } 
  */

  console.log(message);
  // Sign the message with the privatekey
  const signature = await wallet._signTypedData(
    message.domain,
    message.types,
    message.value
  );

  // Calculate the EIP-712 orderHash
  const orderHash = ethers.utils._TypedDataEncoder.hash(
    message.domain,
    message.types,
    message.value
  );

  ///  [limitOrderRequestParams] 发请求到 /limit/order/create
  const limitOrderRequestParams = {
    orderHash,
    data: message.value,
    chainId: 10,
    signature,
  };
  console.log();
  try {
    console.log(limitOrderRequestParams);
    // const resp = await okx.createLimitOrder(limitOrderRequestParams);
    const resp = await okx.getLimitOrderList({
      chainId: 10,
      makerAsset: userAddress,
    });
    console.log(resp);
  } catch (error) {
    console.log(error);
  }
}

main();
