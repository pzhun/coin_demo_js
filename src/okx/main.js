const okx = require("./okx");
const ethers = require("ethers");

async function main() {
  try {
    // const resp = await okx.getLimitOrderList({
    //   chainId: 10,
    //   makerAsset: "address",
    // });

    const resp = await okx.getAllLimitOrderList({
      chainId: 137,
    });
    console.log(resp.data);
  } catch (error) {
    console.log(error);
  }
}

main();
