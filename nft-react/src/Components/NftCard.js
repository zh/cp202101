import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';

const explorerUri = 'https://explorer.bitcoin.com/bch/tx/';

function CardImage(token, size) {
  const waifuPrefix = 'https://icons.waifufaucet.com/original/';
  const ipfsPrefix = 'https://ipfs.io/ipfs/';
  if (token.symbol.toLowerCase() === 'waifu')
    return `${waifuPrefix}${token.id}.png`;
  if (token.uri && token.uri.startsWith('Qm'))
    return `${ipfsPrefix}${token.uri}`;
  let defaultImage = `https://via.placeholder.com/${size}`;
  if (token.type === 129) defaultImage += '/09f/fff.png?text=NFT+Group';
  return defaultImage;
}

const NftCard = (props) => {
  const { token, size, nolinks, onDetails } = props;
  const maxW = parseInt(size, 10) + 45;
  const height = nolinks && token.type !== 129 ? size : 150;

  if (!token || !token.id) return <div>No such token in the wallet.</div>;

  return (
    <Card
      style={{
        maxWidth: maxW,
        boxShadow: '0 5px 8px 0 rgba(0, 0, 0, 0.3)',
        backgroundColor: '#fafafa',
      }}
    >
      <CardActionArea>
        <CardMedia
          style={{ height: `${height}px` }}
          image={CardImage(token, size)}
        />
        <CardContent>
          <Typography color="primary" variant="h5">
            {token.name}
          </Typography>
          <Typography color="textSecondary" variant="subtitle2">
            {token.symbol}
          </Typography>
          {token.type === 129 && (
            <Typography color="textSecondary" variant="subtitle2">
              Quantity: {token.quantity}
            </Typography>
          )}
        </CardContent>
      </CardActionArea>
      <CardActions>
        {nolinks ? (
          <></>
        ) : (
          <Link to={`/view/${token.id}`}>
            <Button size="small" color="primary" onClick={onDetails}>
              Details
            </Button>
          </Link>
        )}
        <a
          href={`${explorerUri}${token.id}`}
          target="_blank"
          rel="noopener noreferrer"
          download
        >
          Explorer
        </a>
      </CardActions>
    </Card>
  );
};

export default NftCard;
