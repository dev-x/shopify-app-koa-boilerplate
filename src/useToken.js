import { useEffect, useState } from 'react';
import createApp from '@shopify/app-bridge';
import { Redirect } from '@shopify/app-bridge/actions';
import { getSessionToken } from '@shopify/app-bridge-utils';

function useToken() {
  const [shopOrigin, shopOriginSet] = useState(null);
  const [error, errorSet] = useState(false);
  const [token, tokenSet] = useState(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    const _shopOrigin = shopOrigin || url.searchParams.get('shop');
    if (!_shopOrigin) {
      errorSet(true);
      return;
    }
    (async () => {
      let lToken = null;
      if (window.top === window.self) {
        window.location.assign(`/auth?shop=${_shopOrigin}`);
      } else {
        const app = createApp({
          apiKey: process.env.REACT_APP_API_KEY,
          shopOrigin: _shopOrigin,
        });
        function redirect() {
          Redirect.create(app).dispatch(Redirect.Action.REMOTE, `${url.protocol}//${url.host}/auth?shop=${_shopOrigin}`);
        }
        // get session token
        lToken = await getSessionToken(app);
        if (!lToken) {
          redirect();
        } else {
          try {
            const resp = await fetch(`/api/verify_token?shop=${_shopOrigin}&token=${lToken}`);
            if (resp.ok) {
              const data = await resp.json();
              if (data && data.status === 'ok') {
                shopOriginSet(_shopOrigin);
                tokenSet(lToken);
              } else {
                redirect();
              }
            } else {
              redirect();
            }
          } catch (err) {
            redirect();
          }
        }
      }
    })();
  }, []);

  return {shopOrigin, error, token};
}

export default useToken;