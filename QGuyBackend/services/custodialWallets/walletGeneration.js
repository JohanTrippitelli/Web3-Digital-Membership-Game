const ethers = require("ethers");

class CustodialWalletService {
  constructor() {
    this.wallets = {};
  }

  async generateWallet(userName) {
    try {
      const wallet = ethers.Wallet.createRandom();
      // Store wallet information in the database
      const newWallet = await WalletModel.create({
        username: userName,
        address: wallet.address,
        privateKey: wallet.privateKey,
      });
      return;
    } catch (error) {}
  }
}

module.exports = CustodialWalletService;
