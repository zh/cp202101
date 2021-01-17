import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import API from '../services/api.service';

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

const Groups = () => {
  const classes = useStyles();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [reload, setReload] = useState(0);

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await API.getGroups();
      if (!data || !data.code || data.code !== 200) return;
      setLoading(false);
      setGroups(data.data);
    })();
  }, [setGroups, reload]);

  return (
    <Container>
      <Typography color="textPrimary" gutterBottom variant="h2" align="center">
        NFT Groups Details
      </Typography>
      {loading ? (
        <div>loading...</div>
      ) : (
        <>
          <div>
            <button
              onClick={() => {
                setReload(reload + 1);
              }}
            >
              <i className="fa fa-refresh"></i>
              &nbsp;Refresh
            </button>
          </div>
          <TableContainer component={Paper}>
            <Table className={classes.table} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>TxID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Ticker</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell>Document URI</TableCell>
                  <TableCell>Document Hash</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {groups.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell component="th" scope="row">
                      <Link to={`/view/${row.id}`}>{row.id}</Link>
                    </TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.symbol}</TableCell>
                    <TableCell align="right">{row.quantity}</TableCell>
                    <TableCell>{row.uri || ''}</TableCell>
                    <TableCell>{row.hash || ''}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Container>
  );
};

export default Groups;
