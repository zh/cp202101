// app.js

const Koa = require('koa');
const koaBody = require('koa-bodyparser');
const cors = require('koa2-cors');
const logger = require('koa-logger');
const jsonRes = require('koa-res');
const config = require('./config');

// create app instance
const app = new Koa();

// middleware functions
app.use(koaBody());
app.use(
  jsonRes({
    custom: (ctx) => {
      return {
        name: config.appName || 'nft-api',
      };
    },
  })
);
app.use(
  cors({
    maxAge: config.maxAge / 1000,
    credentials: true,
    origin: '*',
    methods: 'GET, HEAD, OPTIONS, PUT, POST, DELETE',
    headers: 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  })
);
app.use(logger());

// errors handling
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = err.message;
    ctx.app.emit('error', err, ctx);
  }
});

// Require the router here
const wallet = require('./wallet');
const groups = require('./groups');
const tokens = require('./tokens');

// use the router here
app.use(wallet.routes());
app.use(groups.routes());
app.use(tokens.routes());

const server = app
  .listen(config.port, async () => {
    console.log(`Server listening on port: ${config.port}`);
  })
  .on('error', (err) => {
    console.error(err);
  });

module.exports = server;
