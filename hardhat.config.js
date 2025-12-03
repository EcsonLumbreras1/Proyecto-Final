require('dotenv').config({ path: require('find-config')('.env') });
require("@nomicfoundation/hardhat-ethers");

module.exports = {
  solidity: "0.8.28",
  defaultNetwork: 'sepolia',
  networks: {
    sepolia: {
      url: process.env.API_URL,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
