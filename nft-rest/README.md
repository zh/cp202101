# NFT REST API

REST API for easy working with SLP-based non-fungible tokens (NFT) on top of the BCH blockchain.

The SLP NFT tokens on the BCH blockchain can be grouped together. There are NFT group tokens and NFT children tokens inside every group. More information can be found in the [NFT1 Specification](https://github.com/simpleledger/slp-specifications/blob/master/slp-nft-1.md) and also in this [YT video](https://www.youtube.com/watch?v=vvlpYUx6HRs).


## Usage

### Installation

For now, the installation is only possible from the GitHub repository (plans are to have also npm package in the future):

```sh
git clone https://github.com/zh/cp202101.git
cd cp202101/nft-rest
yarn
```
This will install all the dependencies.

_TODO: create npm package_

### Configuration

Copy `config.js.sample` to `config.js` and enter your wallet SLP address and private key (WIF).

SLP address should be something as `simpleledger:qq......` and WIF is starting with `K...` or `L...`.

_TODO: add create wallet API call_


### Starting the backend REST API


```sh
yarn start
```

You can configure the port, on which the daemon to listen in the `config.js` file or directly from the command line:

```sh
$ PORT=8122 yarn start
...
Server listening on port: 8122
```

## Implemented API calls

For testing the API, I ssuggest using great [HTTPie](https://httpie.io/) command line HTTP client. All API calls examples interaction below are done with it.

On success or error the response is in the same format:

```json
{
    "code": ..,
    "data": ...
    "name": "nft-api"
```

Some of the calls, when cannot get information from the blockchain (invalid token *TXID* etc.) are just returning `204 No content` response

There are 3 main endpoints implemented:

### 1. `/wallet` endpoint

Just one call for now, getting the wallet balance. Wallet should be configured in the `config.js` or address and WIF supplied via command line environment parameters:

```sh
APIADDR=simpleledger:... APIWIF=Kw... PORT=8080 yarn start
```

#### `GET /wallet`


```sh
$ http localhost:8000/wallet
{
    "code": 200,
    "data": {
        "address": "simpleledger:...",
        "balance": {
            "confirmed": ...,
            "unconfirmed": 0
        }
    },
    "name": "nft-api"
}
```

### 2. `/groups` endpoint

For working with **NFT group tokens**

#### `GET /groups`

Get information about all NFT group tokens, available in the wallet.

```sh
$ http localhost:8000/groups
{
    "code": 200,
    "data": [
        {
            "id": "...",
            "name": "...",
            "quantity": "10000",
            "symbol": "..."
        },
        {...}
        ...
    ],
    "name": "nft-api"   
```

#### `GET /groups/:txid`

Get NFT children of specific group with given TXID.

```sh
$ http localhost:8080/groups/989847....
{
    "code": 200,
    "data": [
        {
            "id": "...",
            "name": "...",
            "symbol": "...",
            "uri": "https://..."
        },
        {...}
        ...
    ],
    "name": "nft-api"
```

#### `POST /groups name=... ticker=... ....`

Create new NFT group token in the current wallet. Parameters:

* *name* - **(required)** name of the token, for example **Swords**
* *ticker* - **(required)** short alias of the token, for example **SWD**
* *uri* - **(optional)** URI of the documentation or attached meta data (IPFS hash etc.)
* *hash* - **(optional)** Hash of the document, specified in the **uri* parameter
* *quantity* - **(optional)** Intitial guantity of the token, **default = 1000**

> **!!! WARNING The way NFT tokens work on the BCH blockchain, in order to create children token, the group tokens need to be burn. Be sure to create group tokens with enough initial quantity.**

In is not impossible to add new group tokens later, but in the moment it is not implemented.

_TODO: add update group token quantity API call (PUT/PATCH)_

```sh
$ http POST localhost:8000/groups name="SLP REST Test" ticker=SLPRT uri=http://github.com/
{
    "code": 201,
    "data": "949c5360afc9beff4d9fa6631686bf305f34fff4d87ea2d3dbb916973dd5d50b",
    "name": "nft-api"
}
```

The result is the transaction ID of the [new created NFT group token](https://explorer.bitcoin.com/bch/tx/949c5360afc9beff4d9fa6631686bf305f34fff4d87ea2d3dbb916973dd5d50b).

### 3. `/tokens` endpoint

For getting information about specific NFT token (group or child) and creating new children in a given group

#### `GET /tokens/:txid`

Get information about specific token. It can be group or child NFT token. Format is the same as the one entry format in the `/groups/:txid` call above.

```sh
$ http localhost:8000/tokens/949c5360afc9beff4d9fa6631686bf305f34fff4d87ea2d3dbb916973dd5d50b
{
    "code": 200,
    "data": {
        "id": "949c5360afc9beff4d9fa6631686bf305f34fff4d87ea2d3dbb916973dd5d50b",
        "name": "SLP REST Test",
        "symbol": "SLPRT",
        "uri": "http://github.com/"
    },
    "name": "nft-api"
}
```

#### `POST /tokens group=... name=... ticker=... ...`

Create a new child NFT token in a specified group. Parameters:

* *group* - **(required)** Group NFT token TXID to creat the child token in
* *name* - **(required)** name of the token, for example **Magic Sword**
* *ticker* - **(required)** short alias of the token, for example **MAGIC**
* *uri* - **(optional)** URI of the documentation or attached meta data (IPFS hash etc.)
* *hash* - **(optional)** Hash of the document, specified in the **uri* parameter
* *receiver* - **(optional)** SLP address to send the created child token

```sh
$ http POST localhost:8000/tokens name="SLP REST Child #1" ticker=SLPRC group=949c536... uri=http://github.com/
{
    "code": 201,
    "data": "9ef42c51a891b7c5ebd9136d566290911b3bc18f8f5b883bba14315e95dd6cb4",
    "name": "nft-api"
}
```

The result is the transaction ID of the [new created NFT child token](https://explorer.bitcoin.com/bch/tx/9ef42c51a891b7c5ebd9136d566290911b3bc18f8f5b883bba14315e95dd6cb4).

## Future plans

In the moment the server side is implemented as an individual user personal NFT generator. In order to be used as a service, some additions are required:

* *security* - protect the important calls
* *security* - rate limit the incoming requests
* *performance* - distribute group tokens to several addresses to avoid waiting for tx confirmation
* *performance* - optimize the way children NFT token are created - send `burn` and child `genesis` txs as a one.
* *enhancement* - support also `testnet3`
* *enhancement* - implement more calls in every endpoint - create wallet, change token quantity
 etc.
* *development* - tests