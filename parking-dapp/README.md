#User Interface for Dapp
A Dapp has one or more contracts and an UI to interact with them. 
<br>For the contract of this Dapp see own section <https://github.com/blakeberg/parking-dapp>

<table>
  <tr>
    <td colspan="2">
      <img src="https://raw.githubusercontent.com/blakeberg/parking-dapp/master/parking-dapp/ressources/pp-overview.png"/>
    </td>
  </tr>
  <tr>
   <td>
    <img src="https://raw.githubusercontent.com/blakeberg/parking-dapp/master/parking-dapp/ressources/pp-modal-message.png" width="400"/>
   </td>
   <td align="right">
    <img src="https://raw.githubusercontent.com/blakeberg/parking-dapp/master/parking-dapp/ressources/pp-modal-question.png" width="400"/>
   </td>
  </tr>
</table>

## Run the Dapp
You only need a running Ethereum client and for reservation (what is a transaction) an unlocked account.
The Ethereum client should have started with RPC in **testnet** and available under <http://localhost:8545>

> to start an Ethereum geth client type `geth --testnet --rpc --rpccorsdomain "http://localhost:3000"`
> <br>The rpccorsdomain allows the dapp to accept communication to `http://localhost:8545`

At once you need to clone this repository and an installed JavaScript App Platform Meteor.
<br>Then you can start it in directory `./parking-dapp` with command `meteor`.

Run the dapp in browser call <http://localhost:3000> *(this should allowed via `--rpccorsdomain`)*

### Docker Container
There are also Docker container for Ethereum client and JavaScript App Platform Meteor and NodeJS available.<br>
* Ethereum client <https://github.com/blakeberg/geth-node>
* JavaScript App Platform <https://github.com/blakeberg/meteor-nodejs>

You can link both containers so that Apps can connect to Ethereum. Within container "meteor-nodejs"
you can clone this repo with `git clone https://github.com/blakeberg/parking-dapp.git`.
Start Ethereum then with `geth --testnet --rpc --rpcaddr "geth" --rpccorsdomain "http://meteor:3000"`

> geth and meteor are the host name of the containers. You can allow all hosts with "0.0.0.0" or more specific IP address instead.

Before you have to change to this `const ETH_RPC_ADDRESS = 'http://geth:8545';` in `parking-dapp.js`<br>
Run the dapp in browser call <http://meteor:3000>

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

## Detailled description
One screen with a short description of all elements.
![](https://raw.githubusercontent.com/blakeberg/parking-dapp/master/parking-dapp/ressources/pp-overview-description.png)


