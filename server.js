require('isomorphic-fetch');
const { default: createShopifyAuth, verifyRequest } = require('koa-shopify-jwt-auth');
const { receiveWebhook, registerWebhook } = require('@shopify/koa-shopify-webhooks');
const dotenv = require('dotenv');
const Koa = require('koa');
const app = new Koa();

dotenv.config();

const tokens = {};
function storeToken(shop, token) {
  tokens[shop] = token;
}
async function getToken(shop) {
  return typeof tokens[shop] === 'undefined' ? null : tokens[shop];
}

const {
  SHOPIFY_API_SECRET_KEY,
  SHOPIFY_API_KEY,
  SERVER_PORT,
  TUNNEL_URL,
} = process.env;

app.proxy = true;

app.use(createShopifyAuth({
  apiKey: SHOPIFY_API_KEY,
  secret: SHOPIFY_API_SECRET_KEY,
  scopes: ['read_products', 'write_products'],
  async afterAuth(ctx) {
    console.log('here')
    const { shop, accessToken } = ctx.session;
    storeToken(shop, accessToken);

    /*
    const registration = await registerWebhook({
      address: `${TUNNEL_URL}/webhooks/products/create`,
      topic: 'PRODUCTS_CREATE',
      accessToken,
      shop,
      apiVersion: '2020-07',
    });
    */
    const registration = await registerWebhook({
      address: `${TUNNEL_URL}/webhooks/app/uninstalled`,
      topic: 'APP_UNINSTALLED',
      accessToken,
      shop,
      apiVersion: '2020-07',
    });

    if (registration.success) {
      console.log('Successfully registered webhook!');
    } else {
      console.log('Failed to register webhook', registration.result);
    }
    // await getSubscriptionUrl(ctx, accessToken, shop);

    console.log('TCL: tokens', tokens);
    ctx.redirect(`https://${shop}/admin/apps/${SHOPIFY_API_KEY}`);
  },
}));


app.use(verifyRequest({
  secret: SHOPIFY_API_SECRET_KEY,
  getOfflineToken: getToken, // if the function returns null it will be redirected to auth flow
}));

app.listen(SERVER_PORT || 4001);
