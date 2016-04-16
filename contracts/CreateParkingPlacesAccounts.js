for (i = 1; i < 19; i++) {
    personal.newAccount("place" + i);
    eth.sendTransaction({from:eth.accounts[0], to:eth.accounts[i], value: web3.toWei(0.5, "ether")});
    personal.unlockAccount(eth.accounts[i], "place" + i);
}
