const Blockchain = require('./blockchain.js');
const pineapplecoin = new Blockchain();

const bc1 = {
  "chain": [{
      "index": 1,
      "timeStamp": 1576443446264,
      "transactions": [],
      "nonce": 100,
      "hash": "0",
      "previousBlockHash": "0"
    },
    {
      "index": 2,
      "timeStamp": 1576443494730,
      "transactions": [],
      "nonce": 18140,
      "hash": "0000b9135b054d1131392c9eb9d03b0111d4b516824a03c35639e12858912100",
      "previousBlockHash": "0"
    },
    {
      "index": 3,
      "timeStamp": 1576443497194,
      "transactions": [{
        "amount": 12.5,
        "sender": "00",
        "recipient": "7fbc20701f7d11ea949cad495f21bfe9",
        "transactionId": "9ca69f801f7d11ea949cad495f21bfe9"
      }],
      "nonce": 77894,
      "hash": "00000550e5e4661a542c053c42ae91db80724b792be935486e09291f6181e456",
      "previousBlockHash": "0000b9135b054d1131392c9eb9d03b0111d4b516824a03c35639e12858912100"
    },
    {
      "index": 4,
      "timeStamp": 1576443548275,
      "transactions": [{
          "amount": 12.5,
          "sender": "00",
          "recipient": "7fbc20701f7d11ea949cad495f21bfe9",
          "transactionId": "9e1830e01f7d11ea949cad495f21bfe9"
        },
        {
          "amount": 44999,
          "sender": "stephen",
          "recipient": "jason",
          "transactionId": "b1ed66801f7d11ea949cad495f21bfe9"
        },
        {
          "amount": 33,
          "sender": "stephen",
          "recipient": "jason",
          "transactionId": "b424dff01f7d11ea949cad495f21bfe9"
        },
        {
          "amount": 334,
          "sender": "stephen",
          "recipient": "jason",
          "transactionId": "b5db1b701f7d11ea949cad495f21bfe9"
        }
      ],
      "nonce": 7201,
      "hash": "0000e60a24911698e1b03f4b2df014b036145b8a856ecb1c435967c3083c60e3",
      "previousBlockHash": "00000550e5e4661a542c053c42ae91db80724b792be935486e09291f6181e456"
    },
    {
      "index": 5,
      "timeStamp": 1576443566885,
      "transactions": [{
          "amount": 12.5,
          "sender": "00",
          "recipient": "7fbc20701f7d11ea949cad495f21bfe9",
          "transactionId": "bc8a88701f7d11ea949cad495f21bfe9"
        },
        {
          "amount": 3343,
          "sender": "stephen",
          "recipient": "jason",
          "transactionId": "c1613dd01f7d11ea949cad495f21bfe9"
        },
        {
          "amount": 32343,
          "sender": "stephen",
          "recipient": "jason",
          "transactionId": "c29773e01f7d11ea949cad495f21bfe9"
        },
        {
          "amount": 323443,
          "sender": "stephen",
          "recipient": "jason",
          "transactionId": "c48f4c401f7d11ea949cad495f21bfe9"
        },
        {
          "amount": 3234443,
          "sender": "stephen",
          "recipient": "jason",
          "transactionId": "c5c979f01f7d11ea949cad495f21bfe9"
        }
      ],
      "nonce": 6255,
      "hash": "00009e7cd140fb9f18b8608e18690e35c9fc4cb743dcbd3fefc661972c9d4c1a",
      "previousBlockHash": "0000e60a24911698e1b03f4b2df014b036145b8a856ecb1c435967c3083c60e3"
    },
    {
      "index": 6,
      "timeStamp": 1576443570363,
      "transactions": [{
        "amount": 12.5,
        "sender": "00",
        "recipient": "7fbc20701f7d11ea949cad495f21bfe9",
        "transactionId": "c7a20a801f7d11ea949cad495f21bfe9"
      }],
      "nonce": 114946,
      "hash": "00006ba2f3b9f978d3e16b7504fb3887a4a258cd5a5497a9354933a917b0c1a9",
      "previousBlockHash": "00009e7cd140fb9f18b8608e18690e35c9fc4cb743dcbd3fefc661972c9d4c1a"
    }
  ],
  "pendingTransactions": [{
    "amount": 12.5,
    "sender": "00",
    "recipient": "7fbc20701f7d11ea949cad495f21bfe9",
    "transactionId": "c9b496d01f7d11ea949cad495f21bfe9"
  }],
  "currentNodeUrl": "http://localhost:3001",
  "networkNodes": []
};

console.log('VALID: ', pineapplecoin.chainIsValid(bc1.chain));