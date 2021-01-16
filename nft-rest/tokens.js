const Router = require('koa-router');
const Utils = require('./nft_utils');
const utils = new Utils(config.wallet);

// Prefix all routes with: /tokens
const router = new Router({
  prefix: '/tokens',
});

router.get('/:id', async (ctx, next) => {
  ctx.body = await utils.getTokenInfo(ctx.params.id);
  await next();
});

router.post('/', async (ctx, next) => {
  // Check if any of the data field not empty
  if (
    !ctx.request.body.name ||
    !ctx.request.body.ticker ||
    !ctx.request.body.group
  ) {
    ctx.response.status = 400;
    ctx.body = 'Please enter the data';
  } else {
    const groupExists = await utils.tokenExists(ctx.request.body.group);
    if (!groupExists) {
      ctx.response.status = 400;
      ctx.body = 'Please enter valid group';
    } else {
      const childConfig = {
        group: ctx.request.body.group,
        name: ctx.request.body.name,
        ticker: ctx.request.body.ticker,
        uri: ctx.request.body.uri || null,
        hash: ctx.request.body.hash || null,
      };
      ctx.response.status = 201;
      ctx.body = await utils.createChild(
        childConfig,
        ctx.request.body.receiver
      );
    }
  }
  await next();
});

module.exports = router;
