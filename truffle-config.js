const HDWalletProvider = require('@truffle/hdwallet-provider');
const path = require("path");
require('dotenv').config();

module.exports = {
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: `${process.env.DEV_PORT_NUMBER}`,            // Standard Ethereum port (default: none)
      network_id: `${process.env.DEV_NETWORK_ID}`     // Any network (default: none)
    },
    mumbai: {
      provider: function () {
        return new HDWalletProvider(`${process.env.MNEMONIC}`, `https://polygon-mumbai.infura.io/v3/${process.env.INFURA_ID}`)
      },
      network_id: 80001,
      // from: '0x95E6Fc934505B29b0a13655D0E43de15Ea1afC30'
    },
    polygon: {
      provider: function () {
        return new HDWalletProvider(`${process.env.MNEMONIC}`, `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_ID}`)
      },
      network_id: 137
    },
    rinkeby: {
      provider: function() {
        return new HDWalletProvider(`${process.env.MNEMONIC}`, `https://rinkeby.infura.io/v3/${process.env.INFURA_ID}`)
      },
      network_id: 4
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(`${process.env.MNEMONIC}`, `https://ropsten.infura.io/v3/${process.env.INFURA_ID}`)
      },
      network_id: 3
    },
    kovan: {
      provider: function() {
        return new HDWalletProvider(`${process.env.MNEMONIC}`, `https://kovan.infura.io/v3/${process.env.INFURA_ID}`)
      },
      network_id: 42
    }
  },
  plugins: ["solidity-coverage"],
  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.13",    // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      settings: {          // See the solidity docs for advice about optimization and evmVersion
        optimizer: {
          enabled: false,
          runs: 200
        },
        evmVersion: "byzantium"
      }
    },
  }
};
