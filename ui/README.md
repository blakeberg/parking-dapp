#User Interface for Dapp
A Dapp has one or more contracts and an UI to interact with them. **New Icons** (!)
<br>For the contract of this Dapp see own section <https://github.com/blakeberg/parking-dapp>

<table>
  <tr>
    <td colspan="3">
      <img src="https://raw.githubusercontent.com/blakeberg/parking-dapp/master/ui/ressources/pp-overview.png"/>
    </td>
  </tr>
  <tr>
   <td>
    <img src="https://raw.githubusercontent.com/blakeberg/parking-dapp/master/ui/ressources/pp-modal-message.png"/>
   </td>
   <td>
    <img src="https://raw.githubusercontent.com/blakeberg/parking-dapp/master/ui/ressources/pp-modal-question.png"/>
   </td>
   <td>
    <img src="https://raw.githubusercontent.com/blakeberg/parking-dapp/master/ui/ressources/pp-new-icons.png"/>
   </td>
  </tr>
</table>

## Run the Dapp
You only need a running Ethereum client and for reservation (what is a transaction) an unlocked account.
The Ethereum client should have started with RPC in **testnet** and available under <http://localhost:8545>

> to start an Ethereum geth client type `geth --testnet --rpc --rpccorsdomain "http://localhost:3000"`
> <br>The rpccorsdomain allows the dapp to accept communication to `http://localhost:8545`

At once you need to clone this repository and an installed JavaScript App Platform Meteor.
<br>Then you can start it in directory `./ui` with command `meteor`.

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
    //update all places and markers every x blocks
    const REFRESH_INTERVALL = 20;
    //threshold for slot capacity of places determine icons (all % in free slots)
    const RED_THRESHOLD = 20; //under 20% free
    const YELLOW_THRESHOLD = 50; //under 50% free
    //rpc address of ethereum client
    const ETH_RPC_ADDRESS = 'http://localhost:8545';
    //contract address
    const CONTRACT_ADDRESS = "0xad3d7d21862dfa1f9d91569240a9ed06ac276b4d";

## Detailled description
One screen with a short description of all elements.
<img src="https://raw.githubusercontent.com/blakeberg/parking-dapp/master/ui/ressources/pp-overview-description.png"/>


