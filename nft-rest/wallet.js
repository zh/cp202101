const Router = require('koa-router');
const config = require('./config');
const Utils = require('./nft_utils');
const utils = new Utils(config.wallet);

// Prefix all routes with: /tokens
const router = new Router({
  prefix: '/wallet',
});

// Routes will go here
router.get('/', async (ctx, next) => {
  const balance = await utils.getBalances();
  ctx.body = {
    address: config.wallet.address,
    balance: balance,
  };
  await next();
});

module.exports = router;
