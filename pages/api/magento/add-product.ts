import commonHandler from '../common';
import addProductToCart from 'Magento/commands/addProductToCart';
import Cookies from 'cookies';
import { productFactory, ProductType } from '@/Product/entities/Product';
import createCart from 'Magento/commands/createCart';
import { getMappedCart } from './fetch-cart';

const handler = commonHandler.post('/api/add-product', async (req, res) => {
  const cookies = new Cookies(req, res);
  const token = cookies.get('token');
  let cartId = cookies.get('cartId');
  // @ts-ignore
  const body = JSON.parse(req.body);

  if (!cartId) {
    cartId = await createCart(token);
    cookies.set('cartId', cartId);
  }

  await addProductToCart(productFactory(body.product), body.quantity, cartId!, token);
  const cartResponse = await getMappedCart(cartId!, token);

  // @ts-ignore
  res.status(200).json(cartResponse);
  res.end();
});

export default handler;
