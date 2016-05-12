if (Meteor.isClient) {

  var block;
  var eventlogs = [];
  eventlogs.push("entry1");
  eventlogs.push("entry2");
  eventlogs.push("...");

  if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
  } else {
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  Meteor.startup(function () {
    EthBlocks.init();
    EthAccounts.init();
  });

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

  Template.dapp.events({
    'click .dapp-block-button'(event) {
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
      event.preventDefault();
      var to = TemplateVar.getFrom('.to .dapp-address-input', 'value');
      showMessage("click .dapp-large", "click event for .dapp-large (account choosen: " + to + ")");
    },
    'change .block'(event) {
      event.preventDefault();
      block = event.target.value;
      showMessage("change .block", "change event for .block (block input: " + block + ")");
    }
  });

  function formatTS(timestamp) {
    var date = new Date(timestamp * 1000);
    var hours = date.getHours();
    var minutes = "0" + date.getMinutes();
    var seconds = "0" + date.getSeconds();
    return hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
  }

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

