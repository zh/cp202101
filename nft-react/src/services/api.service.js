import axios from 'axios';

const ApiURL = 'http://127.0.0.1:8000/';

/*
const register = (username, address) => {
  return axios.post(ApiURL + 'api/v1/account', {
    username,
    address,
  });
};
*/

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

export default {
  getNfts,
  getGroups,
  getTokenInfo,
  getTokensInGroup,
};
