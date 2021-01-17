const BITBOX = require('bitbox-sdk').BITBOX;
const { GrpcClient } = require('grpc-bchrpc-node');
const slpjs = require('slpjs');
const BigNumber = require('bignumber.js');
const bchaddr = require('bchaddrjs-slp');
const axios = require('axios');

const slpdbUri = 'https://slpdb.fountainhead.cash/q/';
const bchUri = 'https://rest.bitcoin.com/v2/';
const bitbox = new BITBOX({ restURL: 'https://bchd.fountainhead.cash' });
// const client = new GrpcClient({url: 'bchd.ny1.simpleledger.io' })
const client = new GrpcClient({ url: 'bchd.fountainhead.cash' });
const validator = new slpjs.BchdValidator(client, console);
const bchdNetwork = new slpjs.BchdNetwork({
  BITBOX: bitbox,
  client,
  validator,
});
const btoa = function (str) {
  return Buffer.from(str).toString('base64');
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function queryRest(route) {
  const url = bchUri + route;
  const options = {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
    },
    url,
  };
  const result = await axios(options);
  return result.data ? result.data : {};
}

async function querySlpDB(q) {
  const b64 = btoa(JSON.stringify(q));
  const url = slpdbUri + b64;
  console.log(url);
  const options = {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
    },
    url,
  };
  const result = await axios(options);
  return result.data ? result.data : null;
}

function group2obj(info) {
  const {
    tokenIdHex: id,
    name,
    symbol,
    genesisOrMintQuantity: quantity,
  } = info;
  const obj = { id, name, symbol, quantity };
  if (info.documentUri) obj.uri = info.documentUri;
  if (info.documentSha256) obj.hash = info.documentSha256;
  return obj;
}

function child2obj(info) {
  const {
    tokenIdHex: id,
    versionType: type,
    name,
    symbol,
    genesisOrMintQuantity: quantity,
  } = info;
  const obj = { id, type, name, symbol, quantity };
  if (info.documentUri) obj.uri = info.documentUri;
  if (info.documentSha256) obj.hash = info.documentSha256;
  return obj;
}

class NftUtils {
  // wallet = { address: '', wif: '' }
  constructor(wallet) {
    this.wallet = wallet;
  }

  async getBalances() {
    try {
      const url = 'address/details/' + this.wallet.address;
      const balance = await queryRest(url);
      return {
        confirmed: balance.balanceSat,
        unconfirmed: balance.unconfirmedBalanceSat,
      };
    } catch (error) {
      console.error('error in utils.getBalances(): ', error);
    }
  }

  async getAllTokens(limit = 100, skip = 0) {
    try {
      const query = {
        v: 3,
        q: {
          db: ['g'],
          aggregate: [
            { $match: { 'graphTxn.outputs.address': this.wallet.address } },
            { $unwind: '$graphTxn.outputs' },
            {
              $match: {
                'graphTxn.outputs.status': 'UNSPENT',
                'graphTxn.outputs.address': this.wallet.address,
              },
            },
            {
              $group: {
                _id: '$tokenDetails.tokenIdHex',
                slpAmount: { $sum: '$graphTxn.outputs.slpAmount' },
              },
            },
            { $sort: { slpAmount: -1 } },
            { $match: { slpAmount: { $gt: 0 } } },
            {
              $lookup: {
                from: 'tokens',
                localField: '_id',
                foreignField: 'tokenDetails.tokenIdHex',
                as: 'token',
              },
            },
          ],
          sort: { slpAmount: -1 },
          skip: skip,
          limit: limit,
        },
      };
      const result = await querySlpDB(query);
      if (!result || !result.g || result.g.length === 0) {
        return {};
      }
      return result.g.map((token) => token.token[0].tokenDetails);
    } catch (error) {
      console.error('error in utils.getAllTokens(): ', error);
    }
  }

  async validTokens(tokenIds) {
    try {
      const query = {
        v: 3,
        q: {
          db: ['g'],
          aggregate: [
            { $match: { 'tokenDetails.tokenIdHex': { $in: tokenIds } } },
            { $unwind: '$graphTxn.outputs' },
            {
              $match: {
                'graphTxn.outputs.status': 'UNSPENT',
                'graphTxn.outputs.slpAmount': {
                  $gt: 0,
                },
              },
            },
          ],
          limit: 100,
          skip: 0,
        },
      };
      const result = await querySlpDB(query);
      if (!result || !result.g || result.g.length === 0) {
        return {};
      }
      return result.g.map((token) => token.graphTxn.details.tokenIdHex);
    } catch (error) {
      console.error('error in utils.validTokens(): ', error);
    }
  }

  async getNftList() {
    try {
      const allTokens = await this.getAllTokens();
      const nftTokens = allTokens.filter(function (token) {
        if (
          [65, 129].includes(token.versionType) &&
          token.transactionType === 'GENESIS'
        )
          return true;
        return false;
      });
      return nftTokens.map((token) => child2obj(token));
    } catch (error) {
      console.error('error in utils.getGroupsList(): ', error);
    }
  }

  async getGroupsList() {
    try {
      const allTokens = await this.getAllTokens();
      const groupTokens = allTokens.filter(function (token) {
        if (token.versionType === 129 && token.transactionType === 'GENESIS')
          return true;
        return false;
      });
      return groupTokens.map((token) => group2obj(token));
    } catch (error) {
      console.error('error in utils.getGroupsList(): ', error);
    }
  }

  async getGroupTokens(groupId, limit = 100, skip = 0) {
    try {
      const exists = await this.tokenExists(groupId);
      if (!exists) return [];
      const query = {
        v: 3,
        q: {
          db: ['t'],
          aggregate: [
            { $match: { nftParentId: groupId } },
            { $skip: skip },
            { $limit: limit },
          ],
        },
      };
      const result = await querySlpDB(query);
      if (!result || !result.t) {
        return {};
      }
      const allTokenIds = result.t.map(
        (token) => token.tokenDetails.tokenIdHex
      );
      const validIds = await this.validTokens(allTokenIds);
      return result.t
        .filter(function (token) {
          if (validIds.includes(token.tokenDetails.tokenIdHex)) return true;
          return false;
        })
        .map((token) => child2obj(token.tokenDetails));
    } catch (error) {
      console.error('error in utils.getGroupTokens(): ', error);
    }
  }

  async getTokenInfo(tokenId) {
    try {
      const allTokens = await this.getAllTokens();
      const tokenInfo = allTokens.filter(function (token) {
        return token.tokenIdHex === tokenId;
      });
      if (tokenInfo.length === 0) return null;
      return child2obj(tokenInfo[0]);
    } catch (error) {
      console.error('error in utils.getTokenInfo(): ', error);
    }
  }

  async createGroup(config) {
    try {
      const name = config.name || 'NFT Test Group';
      const ticker = config.ticker || 'NFTGRP';
      const documentUri = config.uri || null;
      const documentHash = config.hash || null;
      const initialTokenQtyBN = new BigNumber(config.quantity);

      const balances = await bchdNetwork.getAllSlpBalancesAndUtxos(
        this.wallet.address
      );
      const bchUtxos = balances.nonSlpUtxos;
      if (bchUtxos.length === 0) return null;

      let inputUtxos = [];
      inputUtxos = inputUtxos.concat(bchUtxos);
      inputUtxos.forEach((txo) => (txo.wif = this.wallet.wif));
      return bchdNetwork.simpleNFT1ParentGenesis(
        name,
        ticker,
        initialTokenQtyBN,
        documentUri,
        documentHash,
        this.wallet.address,
        this.wallet.address,
        bchaddr.toCashAddress(this.wallet.address),
        inputUtxos
      );
    } catch (error) {
      console.error('error in template: ', error);
    }
  }

  async createChild(config, receiver = null) {
    try {
      const name = config.name || 'NFT Test Child';
      const ticker = config.ticker || 'NFTCHLD';
      const documentUri = config.uri || null;
      const documentHash = config.hash || null;
      const tokenId = config.group;
      const to = receiver || this.wallet.address;

      let balances = await bchdNetwork.getAllSlpBalancesAndUtxos(
        this.wallet.address
      );
      let bchUtxos = balances.nonSlpUtxos;
      let groupBalance = new BigNumber(balances.slpTokenBalances[tokenId]);
      if (
        bchUtxos.length === 0 ||
        !groupBalance.isGreaterThan(0) ||
        !balances.slpTokenUtxos[tokenId]
      )
        return null;

      bchUtxos.forEach((j) => (j.wif = this.wallet.wif));
      let tokenUtxos = balances.slpTokenUtxos[tokenId];
      tokenUtxos.forEach((j) => (j.wif = this.wallet.wif));
      const sendCost =
        bchdNetwork.slp.calculateSendCost(
          60,
          bchUtxos.length + tokenUtxos.length,
          3,
          this.wallet.address
        ) - 546;
      let inputUtxos = [...bchUtxos, ...tokenUtxos];
      const burnTxHex = bchdNetwork.txnHelpers.simpleTokenSend({
        tokenId,
        sendAmounts: [new BigNumber(1)],
        inputUtxos,
        tokenReceiverAddresses: [this.wallet.address],
        changeReceiverAddress: this.wallet.address,
      });
      const burnTxId = await bchdNetwork.sendTx(burnTxHex);
      console.log(`burn tx: ${burnTxId}`);
      await sleep(3000);

      let burnUtxo = null;
      balances = await bchdNetwork.getAllSlpBalancesAndUtxos(
        this.wallet.address
      );
      balances.slpTokenUtxos[tokenId].forEach((txo) => {
        if (!burnUtxo && txo.slpUtxoJudgementAmount.isEqualTo(1)) {
          burnUtxo = txo;
        }
      });
      if (!burnUtxo) return null;

      inputUtxos = [burnUtxo, ...balances.nonSlpUtxos];
      inputUtxos.forEach((j) => (j.wif = this.wallet.wif));
      const genesisTxHex = bchdNetwork.txnHelpers.simpleNFT1ChildGenesis({
        nft1GroupId: tokenId,
        tokenName: name,
        tokenTicker: ticker,
        documentUri,
        documentHash,
        tokenReceiverAddress: to,
        bchChangeReceiverAddress: bchaddr.toCashAddress(this.wallet.address),
        inputUtxos,
      });
      const burn = {
        tokenId: Buffer.from(tokenId, 'hex'),
        tokenType: 129,
        amount: '1',
        outpointHash: Buffer.from(Buffer.from(burnUtxo.txid, 'hex').reverse()),
        outpointVout: burnUtxo.vout,
      };
      return bchdNetwork.sendTx(genesisTxHex, [burn]);
    } catch (error) {
      console.error('error in createChild: ', error);
    }
  }

  async tokenExists(tokenId) {
    try {
      const allTokens = await this.getAllTokens();
      return (
        allTokens.filter(function (token) {
          return token.tokenIdHex === tokenId;
        }).length !== 0
      );
    } catch (error) {
      console.error('error in utils.tokenExists(): ', error);
    }
  }
}

module.exports = NftUtils;
