//single page application (SPA) needs access to google maps  and running ethereum client
if (Meteor.isClient) {
  //rpc address of ethereum client
  const ETH_RPC_ADDRESS = 'http://localhost:8545';

  //initialize web3 and address of json rpc api from running ethereum client
  if (typeof web3 === 'undefined') {
    web3 = new Web3(new Web3.providers.HttpProvider(ETH_RPC_ADDRESS));
  }
  
  var eventlogs = [];
  //selected block to estimate or parking
  var block;
  eventlogs.push("entry1");
  eventlogs.push("entry2");
  eventlogs.push("...");

  //call when meteor client starting
  Meteor.startup(function () {
    //EthBlocks with last 50 block information auto updating
    EthBlocks.init();
    EthAccounts.init();
  });

  //template for block and time information
  Template.dapp.helpers({
    currentBlockNumber: function () {
      return EthBlocks.latest.number;
    },
    currentBlockTime: function () {
      return formatTS(EthBlocks.latest.timestamp);
    },
    accounts: function () {
      return EthAccounts.find().fetch();
    },
    contractController: function () {
      return "hexhex";
    },
    contractParkingCosts: function () {
      return "0.0012 ETHER";
    },
    contractLogs: function () {
      return eventlogs;
    },
    estimatedParkingCosts: function () {
      return "0.0012 ETHER";
    }
  });

  //handle events from dapp template
  Template.dapp.events({
    'click .dapp-block-button'(event) {
      // Prevent default browser form submit
      event.preventDefault();
      var to = TemplateVar.getFrom('.to .dapp-address-input', 'value');
      EthElements.Modal.question({
        text: "click .dapp-block-button",
        ok: function () {
          console.log("click event for .dapp-block-button (account choosen: " + to + ")");
        },
        cancel: true
      });
    },
    'click .dapp-large'(event) {
      // Prevent default browser form submit
      event.preventDefault();
      var to = TemplateVar.getFrom('.to .dapp-address-input', 'value');
      showMessage("click .dapp-large", "click event for .dapp-large (account choosen: " + to + ")");
    },
    'change .block'(event) {
      // Prevent default browser form submit
      event.preventDefault();
      block = event.target.value;
      showMessage("change .block", "change event for .block (block input: " + block + ")");
    }
  });

  /**
   * Formatting of an unix timestamp to a 'hh:mm:ss' string
   * @param timestamp the unix timestamp of a block in seconds
   * @returns {string} time formatted as hh:mm:ss
   */
  function formatTS(timestamp) {
    var date = new Date(timestamp * 1000);
    var hours = date.getHours();
    var minutes = "0" + date.getMinutes();
    var seconds = "0" + date.getSeconds();
    return hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
  }

  /**
   * Shows a modal dialog with header and message
   * @param header the header of a modal dialog
   * @param message the message of a modal dialag
   */
  function showMessage(header, message) {
    EthElements.Modal.show({
      template: 'modal_info',
      data: {
        header: header,
        message: message
      }
    });
  }
}

