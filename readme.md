#EthBox

Launch a Ethereum development sandbox in 10 seconds

![EthBox in action](https://media.giphy.com/media/xT0GqwsteZEWYw5XlC/giphy.gif)

    npm install -g ethbox
    ethbox -s path/to/solidity/contracts/

To create a contract

    web3.eth.contract(contracts.MyContract.abi).new({ data: contracts.MyContract.abi }), (err, myContract) => {})