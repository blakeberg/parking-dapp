if (Meteor.isClient) {

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
      EthElements.Modal.question({
        text: "click .dapp-block-button",
        ok: function () {
          console.log("clicked ok modal question on click event for .dapp-block-button")
        },
        cancel: true
      });
    },
    'click .dapp-large'(event) {
      event.preventDefault();
      EthElements.Modal.show({
        template: 'modal_info',
        data: {
          header: "click .dapp-large",
          message: "modal info on click event for .dapp-large"
        }
      });
    },
    'change .block'(event) {
      event.preventDefault();
      EthElements.Modal.show({
        template: 'modal_info',
        data: {
          header: "change .block",
          message: "modal info on change event for .block"
        }
      });
    }
  });

  function formatTS(timestamp) {
    var date = new Date(timestamp * 1000);
    var hours = date.getHours();
    var minutes = "0" + date.getMinutes();
    var seconds = "0" + date.getSeconds();
    return hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
  }
}

