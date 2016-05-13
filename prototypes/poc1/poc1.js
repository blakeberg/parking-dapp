//single page application (SPA) needs access to google maps  and running ethereum client
if (Meteor.isClient) {

    var eventlogs = [];
    eventlogs.push("entry1");
    eventlogs.push("entry2");
    eventlogs.push("...");

    //template for block and time information
    Template.dapp.helpers({
        currentBlockNumber: function () {
            return "XXXXXX (BigNumber)";
        },
        currentBlockTime: function () {
            return "XX:XX:XX (formatted UNIX Timestamp)";
        },
        accounts: function () {
            return "hexhex";
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
            event.preventDefault();
            console.log("click event for .dapp-block-button")
        },
        'click .dapp-large'(event) {
            event.preventDefault();
            console.log("click event for .dapp-large");
        },
        'change .block'(event) {
            event.preventDefault();
            console.log("change event for .block");
        }
    });
}

