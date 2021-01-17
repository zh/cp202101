import React, { useState, useCallback } from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import API from '../services/api.service';

const explorerUri = 'https://explorer.bitcoin.com/bch/tx/';

const Creator = (props) => {
  const txid = props.match.params.txid;
  const [creating, setCreating] = useState(false);
  const [newTxid, setNewTxid] = useState('');
  const [tokenName, setTokenName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState(1000);
  const [uri, setUri] = useState('');
  const [hash, setHash] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'name') setTokenName(value);
    if (name === 'symbol') setSymbol(value);
    if (name === 'quantity') setQuantity(parseInt(value, 10));
    if (name === 'uri') setUri(value);
    if (name === 'hash') setHash(hash);
  };

  const handleSubmit = useCallback(
    async (event) => {
      try {
        event.preventDefault();
        if (tokenName === '' || symbol === '') return;
        setCreating(true);
        if (txid) {
          const { data } = await API.createChild(
            txid,
            tokenName,
            symbol,
            uri,
            hash
          );
          setNewTxid(data.data);
        } else {
          const { data } = await API.createGroup(
            tokenName,
            symbol,
            quantity,
            uri,
            hash
          );
          setNewTxid(data.data);
        }
        setCreating(false);
      } catch (error) {
        console.error(error);
      }
    },
    [newTxid, tokenName, symbol, quantity, uri, hash]
  );

  return (
    <Container>
      <Typography color="textPrimary" gutterBottom variant="h2" align="center">
        Create New {!!txid ? 'Child' : 'Group'}
      </Typography>
      {!!txid && (
        <Typography
          color="textSecondary"
          gutterBottom
          variant="h5"
          align="center"
        >
          Group: {txid}
        </Typography>
      )}
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="name-input"
                  label="Name"
                  name="name"
                  size="small"
                  variant="outlined"
                  error={tokenName === ''}
                  helperText={tokenName === '' ? 'Please enter valid name' : ''}
                  value={tokenName}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="symbol-input"
                  label="Symbol"
                  name="symbol"
                  size="small"
                  variant="outlined"
                  error={symbol === ''}
                  helperText={symbol === '' ? 'Please enter valid symbol' : ''}
                  value={symbol}
                  onChange={handleInputChange}
                />
              </Grid>
              {!txid ? (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="quantity-input"
                    label="Quantity"
                    name="quantity"
                    size="small"
                    variant="outlined"
                    value={quantity}
                    onChange={handleInputChange}
                  />
                </Grid>
              ) : (
                ''
              )}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="uri-input"
                  label="Document URL"
                  name="uri"
                  size="small"
                  variant="outlined"
                  value={uri}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="hash-input"
                  label="Document Hash"
                  name="hash"
                  size="small"
                  variant="outlined"
                  value={hash}
                  onChange={handleInputChange}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Button
              color="primary"
              fullWidth
              variant="contained"
              type="submit"
              disabled={creating}
            >
              Submit
            </Button>
          </Grid>
          <Grid item xs={12}>
            <div>
              {newTxid === '' ? (
                ''
              ) : (
                <a
                  href={`${explorerUri}${newTxid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                >
                  {newTxid}
                </a>
              )}
            </div>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
};

export default Creator;
