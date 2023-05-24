import Common from "ethereumjs-common";

export default async function(app, address, pk, functionAbi) {
  const EthereumTx = require("ethereumjs-tx").Transaction;
  const netid = await app.$web3.eth.net.getId();
  var details = await {
    nonce: 0,
    gasPrice: 0,
    gasLimit: 8000000,
    from: address,
    to: app.$contract.options.address,
    data: functionAbi
  };
  const customCommon = Common.forCustomChain(
    "mainnet",
    {
      name: "privatechain",
      networkId: netid,
      chainId: netid
    },
    "petersburg"
  );

  await app.$web3.eth.getTransactionCount(address, async function(err, nonce) {
    details.nonce = nonce;
    const transaction = await new EthereumTx(details, { common: customCommon });
    console.log(transaction);
    transaction.sign(Buffer.from(pk.slice(2), "hex"));
    var rawdata = (await "0x") + transaction.serialize().toString("hex");
    await app.$web3.eth
      .sendSignedTransaction(rawdata)
      .on("transactionHash", function(hash) {
        console.log(["transferToStaging Trx Hash:" + hash]);
      })
      .on("receipt", async function(receipt) {
        console.log(["transferToStaging Receipt:", receipt]);
      })
      .on("error", function(error) {
        console.log(error);
      });
  });
}
