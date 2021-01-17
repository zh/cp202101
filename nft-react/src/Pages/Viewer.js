import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import API from '../services/api.service';
import NftCard from '../Components/NftCard';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    marginLeft: 'auto',
    marginRight: 'auto',
    width: '512px',
    itemsAlign: 'center',
    color: theme.palette.text.secondary,
  },
}));

const Viewer = (props) => {
  const txid = props.match.params.txid;
  const classes = useStyles();

  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState({});
  const [children, setChildren] = useState([]);
  const [reload, setReload] = useState(0);

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await API.getTokenInfo(txid);
      if (!data || !data.code || data.code !== 200) return;
      setToken(data.data);
      // not a group
      if (data.data.type !== 129) {
        setLoading(false);
        return;
      }
      const { data: nextData } = await API.getTokensInGroup(txid);
      setLoading(false);
      if (
        !nextData ||
        !nextData.code ||
        nextData.code !== 200 ||
        nextData.data.length === 0
      ) {
        return;
      }
      setChildren(nextData.data);
    })();
  }, [setToken, setChildren, reload]);

  return (
    <Container className={classes.root}>
      <Typography color="textPrimary" gutterBottom variant="h2" align="center">
        NFT Viewer
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
            <Grid item xs={12}>
              <Paper className={classes.paper}>
                <NftCard token={token} size={512} nolinks />
              </Paper>
            </Grid>

            {children.length > 0 &&
              children.map((child) => (
                <Grid item xs={12} sm={4} key={child.id}>
                  <NftCard token={child} size={200} />
                </Grid>
              ))}
          </Grid>
        </>
      )}
    </Container>
  );
};

export default Viewer;
