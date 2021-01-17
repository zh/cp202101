import axios from 'axios';

const ApiURL = 'http://127.0.0.1:8000/';

const getNfts = async () => {
  return axios.get(ApiURL + 'tokens');
};

const getGroups = async () => {
  return axios.get(ApiURL + 'groups');
};

const getTokenInfo = async (txid) => {
  return axios.get(ApiURL + 'tokens/' + txid);
};

const getTokensInGroup = async (txid) => {
  return axios.get(ApiURL + 'groups/' + txid);
};

const createGroup = (tokenName, symbol, quantity, uri, hash) => {
  const postObj = {
    name: tokenName,
    ticker: symbol,
    quantity,
  };
  if (uri !== '') postObj.uri = uri;
  if (hash !== '') postObj.hash = hash;
  return axios.post(ApiURL + 'groups/', postObj);
};

const createChild = (txid, tokenName, symbol, uri, hash) => {
  const postObj = {
    group: txid,
    name: tokenName,
    ticker: symbol,
  };
  if (uri !== '') postObj.uri = uri;
  if (hash !== '') postObj.hash = hash;
  return axios.post(ApiURL + 'tokens/', postObj);
};

export default {
  getNfts,
  getGroups,
  getTokenInfo,
  getTokensInGroup,
  createGroup,
  createChild,
};
