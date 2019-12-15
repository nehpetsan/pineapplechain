var express = require('express');
var app = express();
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const uuid = require('uuid/v1');
const port = process.argv[2];
const rp = require('request-promise');

const nodeAddress = uuid().split('-').join('');

const pineapplecoin = new Blockchain();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(express)

app.get('/blockchain', function (req, res) {
  res.send(pineapplecoin);
});

// create a new transaction
app.post('/transaction', function (req, res) {
  const newTransaction = req.body;
  const blockIndex = pineapplecoin.addTransactionToPendingTransactions(newTransaction);
  res.json({
    note: `Transaction will be added in block ${blockIndex}.`
  });
});


// broadcast transaction
app.post('/transaction/broadcast', function (req, res) {
  const newTransaction = pineapplecoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);
  pineapplecoin.addTransactionToPendingTransactions(newTransaction);

  const requestPromises = [];
  pineapplecoin.networkNodes.forEach(networkNodeUrl => {
    const requestOptions = {
      uri: networkNodeUrl + '/transaction',
      method: 'POST',
      body: newTransaction,
      json: true
    };

    requestPromises.push(rp(requestOptions));
  });

  Promise.all(requestPromises)
    .then(data => {
      res.json({
        note: 'Transaction created and broadcast successfully.'
      });
    });
});

app.get('/mine', function (req, res) {
  const lastBlock = pineapplecoin.getLastBlock();
  const previousBlockHash = lastBlock['hash'];
  const currentBlockData = {
    transactions: pineapplecoin.pendingTransactions,
    index: lastBlock['index'] + 1
  }
  const nonce = pineapplecoin.proofOfWork(previousBlockHash, currentBlockData);
  const blockHash = pineapplecoin.hashBlock(previousBlockHash, currentBlockData, nonce);

  //pineapplecoin.createNewTransaction(12.5, "00", nodeAddress);
  const newBlock = pineapplecoin.createNewBlock(nonce, previousBlockHash, blockHash);

  //broadcast
  const requestPromises = [];
  pineapplecoin.networkNodes.forEach(networkNodeUrl => {
    const requestOptions = {
      uri: networkNodeUrl + '/receive-new-block',
      method: 'POST',
      body: {
        newBlock: newBlock
      },
      json: true
    };
    requestPromises.push(rp(requestOptions));
  });

  Promise.all(requestPromises)
    .then(data => {
      const requestOptions = {
        uri: pineapplecoin.currentNodeUrl + '/transaction/broadcast',
        method: 'POST',
        body: {
          amount: 12.5,
          sender: "00",
          recipient: nodeAddress
        },
        json: true
      };

      return rp(requestOptions);
    })
    .then(data => {
      res.json({
        note: "new block mined and broadcast successfully",
        block: newBlock
      });
    });
});

app.post('/receive-new-block', function (req, res) {
  const newBlock = req.body.newBlock;
  const lastBlock = pineapplecoin.getLastBlock();
  const correctHash = lastBlock.hash === newBlock.previousBlockHash;
  const correctIndex = lastBlock['index'] + 1 === newBlock['index'];

  if (correctHash && correctIndex) {
    pineapplecoin.chain.push(newBlock);
    pineapplecoin.pendingTransactions = [];
    res.json({
      note: 'new block received and accepted',
      newBlock: newBlock
    });

  } else {
    res.json({
      note: 'new block rejected',
      newBlock: newBlock
    });
  }
});

//register a node and broadcast it to the network
app.post('/register-and-broadcast-node', function (req, res) {
  const newNodeUrl = req.body.newNodeUrl;
  if (pineapplecoin.networkNodes.indexOf(newNodeUrl) == -1) pineapplecoin.networkNodes.push(newNodeUrl);

  const regNodesPromises = [];
  pineapplecoin.networkNodes.forEach(networkNodeUrl => {
    const requestOptions = {
      uri: networkNodeUrl + '/register-node',
      method: 'POST',
      body: {
        newNodeUrl: newNodeUrl
      },
      json: true
    };

    regNodesPromises.push(rp(requestOptions));
  });
  Promise.all(regNodesPromises)
    .then(data => {
      const bulkRegisterOptions = {
        uri: newNodeUrl + '/register-nodes-bulk',
        method: 'POST',
        body: {
          allNetworkNodes: [...pineapplecoin.networkNodes, pineapplecoin.currentNodeUrl]
        },
        json: true
      }

      return rp(bulkRegisterOptions);
    })
    .then(data => {
      res.json({
        note: 'new node registered with network successfully'
      });
    })
});

//register a node with the network
app.post('/register-node', function (req, res) {
  const newNodeUrl = req.body.newNodeUrl;
  const nodeNotAlreadyPresent = pineapplecoin.networkNodes.indexOf(newNodeUrl) == -1;
  const notCurrentNode = pineapplecoin.currentNodeUrl !== newNodeUrl;
  if (nodeNotAlreadyPresent && notCurrentNode) pineapplecoin.networkNodes.push(newNodeUrl);
  res.json({
    note: 'new node registered successfully with node.'
  });
});

//register bunch of nodes at once
app.post('/register-nodes-bulk', function (req, res) {
  const allNetworkNodes = req.body.allNetworkNodes;
  allNetworkNodes.forEach(networkNodeUrl => {
    const nodeNotALreadyPresent = pineapplecoin.networkNodes.indexOf(networkNodeUrl) == -1;
    const notCurrentNode = pineapplecoin.currentNodeUrl !== networkNodeUrl;
    if (nodeNotALreadyPresent && notCurrentNode) pineapplecoin.networkNodes.push(networkNodeUrl);
  });

  res.json({
    note: 'bulk registration successful'
  });
});

app.get('/consensus', function (req, res) {
  const requestPromises = [];
  pineapplecoin.networkNodes.forEach(networkNodeUrl => {
    const requestOptions = {
      uri: networkNodeUrl + '/blockchain',
      method: 'GET',
      json: true
    };

    requestPromises.push(rp(requestOptions));
  });

  Promise.all(requestPromises)
    .then(blockchains => {
      const currentChainLength = pineapplecoin.chain.length;
      let maxChainLength = currentChainLength;
      let newLongestChain = null;
      let newPendingTransactions = null;
      blockchains.forEach(blockchain => {
        if (blockchain.chain.length > maxChainLength) {
          maxChainLength = blockchain.chain.length;
          newLongestChain = blockchain.chain;
          newPendingTransactions = blockchain.pendingTransactions; //pending transactions of shorter chain should not be deleted. 
        }
      });

      if (!newLongestChain || (newLongestChain && !pineapplecoin.chainIsValid(newLongestChain))) {
        res.json({
          note: 'current chain has not been replaced',
          chain: pineapplecoin.chain
        })
      } else if (newLongestChain && pineapplecoin.chainIsValid(newLongestChain)) {
        pineapplecoin.chain = newLongestChain;
        pineapplecoin.pendingTransactions = newPendingTransactions;
        res.json({
          note: 'this chane has been replaced',
          chain: pineapplecoin.chain
        });
      }
    });
})

app.get('/block/:blockHash', function (req, res) {
  const blockHash = req.params.blockHash;
  const correctBlock = pineapplecoin.getBlock(blockHash);
  res.json({
    block: correctBlock
  })
});

app.get('/transaction/:transactionId', function (req, res) {
  const transactionId = req.params.transactionId;
  const transactionData = pineapplecoin.getTransaction(transactionId);
  res.json({
    transaction: transactionData.transaction,
    block: transactionData.block
  });

});

app.get('/address/:address', function (req, res) {
  const address = req.params.address;
  const addressData = pineapplecoin.getAddressData(address);
  res.json({
    addressData: addressData
  });
});

app.get('/block-explorer', function (req, res) {
  res.sendFile('./block-explorer/index.html', {
    root: __dirname
  });
});

app.listen(port, '0.0.0.0', function () {
  console.log(`Listening on port ${port}...`)
});