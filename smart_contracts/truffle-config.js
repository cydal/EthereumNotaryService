const HDWalletProvider = require("truffle-hdwallet-provider");
const MNEMONIC = "punch awake loyal inject olympic pledge scissors add obtain fragile earth skate";
const INFURA_ENDPOINT = "https://rinkeby.infura.io/v3/772a9b71709044408c889021cc08cac3";



 // NB: since truffle-hdwallet-provider 0.0.5 you must wrap HDWallet providers in a 
 //function when declaring them. Failure to do so will cause commands to hang. ex:



  module.exports = {
    // See <http://truffleframework.com/docs/advanced/configuration>
    // to customize your Truffle configuration!
    //contracts_build_directory: "./build",
    networks: {
        development: {
            host: "localhost",
            port: 8545,
            network_id: "*" // Match any network id
        },

        rinkeby: {
          provider: () => {
            return new HDWalletProvider(MNEMONIC, INFURA_ENDPOINT)
          },
          network_id: 4,
          gas: 5000000,
          gasPrice: 10000000000
        }
    }
};