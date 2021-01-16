const Router = require('koa-router');
const Utils = require('./nft_utils');
const utils = new Utils(config.wallet);

// Prefix all routes with: /tokens
const router = new Router({
  prefix: '/groups',
});

// Routes will go here
router.get('/', async (ctx, next) => {
  ctx.body = await utils.getGroupsList();
  await next();
});

router.get('/:id', async (ctx, next) => {
  ctx.body = await utils.getGroupTokens(ctx.params.id);
  await next();
});

router.post('/', async (ctx, next) => {
  // Check if any of the data field not empty
  if (!ctx.request.body.name || !ctx.request.body.ticker) {
    ctx.response.status = 400;
    ctx.body = 'Please enter the data';
  } else {
    const groupConfig = {
      name: ctx.request.body.name,
      ticker: ctx.request.body.ticker,
      uri: ctx.request.body.uri || null,
      hash: ctx.request.body.hash || null,
      quantity: parseInt(ctx.request.body.quantity, 10) || 1000,
    };
    ctx.response.status = 201;
    ctx.body = await utils.createGroup(groupConfig);
  }
  await next();
});

module.exports = router;
