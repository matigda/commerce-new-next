import commonHandler from './common';
import Cookies from 'cookies';
import applyCoupon from 'Magento/commands/applyCoupon';
import { getMappedCart } from './magento/fetch-cart';

const handler = commonHandler.post('/api/apply-coupon', async (req, res) => {
  const cookies = new Cookies(req, res);
  const token = cookies.get('token');
  const cartId = cookies.get('cartId')!;
  // @ts-ignore
  const body = JSON.parse(req.body);

  await applyCoupon(body.couponCode, cookies.get('cartId')!, token);
  const cartResponse = await getMappedCart(cartId!, token);

  // @ts-ignore
  res.status(200).json(cartResponse);
  res.end();
});

export default handler;
