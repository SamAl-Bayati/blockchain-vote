require('@nomiclabs/hardhat-waffle');
require('@nomiclabs/hardhat-ethers');
require('dotenv').config();

const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID; // Set this in Render environment variables
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY; // Set this in Render environment variables

module.exports = {
  solidity: '0.8.0',
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_PROJECT_ID}`,
      accounts: [`${DEPLOYER_PRIVATE_KEY}`],
    },
  },
};
