if (Meteor.isClient) {

    Template.dapp.helpers({
        currentBlockNumber: function () {
            return "XXXXXX (BigNumber)";
        },
        currentBlockTime: function () {
            return "XX:XX:XX (formatted UNIX Timestamp)";
        }
    });

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

