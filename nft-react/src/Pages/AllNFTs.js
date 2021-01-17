import React, { useState } from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import API from '../services/api.service';
import NftCard from '../Components/NftCard';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    color: theme.palette.text.secondary,
  },
}));

const AllNFTs = () => {
  const classes = useStyles();
  const [loading, setLoading] = useState(true);
  const [tokens, setTokens] = useState([]);
  const [reload, setReload] = useState(0);

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await API.getNfts();
      if (!data || !data.code || data.code !== 200) return;
      setLoading(false);
      setTokens(data.data);
    })();
  }, [setTokens, reload]);

  return (
    <Container className={classes.root}>
      <Typography color="textPrimary" gutterBottom variant="h2" align="center">
        Non-fungible tokens (NFT)
      </Typography>
      {loading ? (
        <div>loading...</div>
      ) : (
        <>
          <Grid item xs={12}>
            <Paper elevation={0} className={classes.paper}>
              <button
                onClick={() => {
                  setReload(reload + 1);
                }}
              >
                <i className="fa fa-refresh"></i>
                &nbsp;Refresh
              </button>
            </Paper>
          </Grid>
          <Grid container spacing={3}>
            {tokens.map((token) => (
              <Grid item xs={12} sm={4} key={token.id}>
                <NftCard token={token} size={250} />
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Container>
  );
};

export default AllNFTs;
