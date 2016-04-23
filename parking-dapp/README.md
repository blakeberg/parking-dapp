#User Interface for Dapp
A Dapp has one or more contracts and an UI to interact with them. 
<br>For the contract of this Dapp see own section <https://github.com/blakeberg/parking-dapp>

![](https://raw.githubusercontent.com/blakeberg/parking-dapp/master/parking-dapp/ressources/pp-overview.png)

## Run the Dapp
You only need a running Ethereum client and for reservation (what is a transaction) an unlocked account.
The Ethereum client should have started with RPC in **testnet** and available under <http://localhost:8545>

> to start an Ethereum geth client type `geth --testnet --rpc --rpccorsdomain "http://localhost:3000"`
> <br>The rpccorsdomain allows the dapp to accept communication to `http://localhost:8545`

At once you need to clone this repository and an installed JavaScript App Platform Meteor.
<br>Then you can start it in directory `./parking-dapp` with command `meteor`.

Run the dapp in browser call <http://localhost:3000>

## Development
As development IDE the WebStorm from JetBrains (Idea) was used and its project files available under `.idea` folder.
A nice feature is the integration of Meteor and live debugging with Chrome Browser extension.
The Meteor files are available under folder `meteor`.

If you want to develop this dapp on your own you can take a branch.
You should your own deployed contract cause this is volatile. Then you should change these constants in `parking-dapp.js`:

    const MAP_ZOOM = 15;
    const CENTER = {lat: 53.143722, lng: 8.214059};
    const TIMEOUT_ANIMATION = 200;
    const ETH_RPC_ADDRESS = 'http://localhost:8545';
    //contract address
    const CONTRACT_ADDRESS = "0xded0a941b130e7617b5a3464cd43eab52e1f6793";

