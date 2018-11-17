

var HDWalletProvider = require('truffle-hdwallet-provider');

var mnemonic = 'punch awake loyal inject olympic pledge scissors add obtain fragile earth skate';

module.exports = {
  networks: { 
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: "*"
    }, 
    rinkeby: {
      provider: function() { 
        return new HDWalletProvider(mnemonic, 'https://rinkeby.infura.io/v3/772a9b71709044408c889021cc08cac3') 
      },
      network_id: 4,
      gas: 45000000,
      gasPrice: 1000000000000000,
    }
  }
};

