import commonHandler from '../common';
import addProductToCart from 'Magento/commands/addProductToCart';
import Cookies from 'cookies';
import { productFactory, ProductType } from '@/Product/entities/Product';
import createCart from 'Magento/commands/createCart';
import removeItemFromCart from 'Magento/commands/removeItemFromCart';
import Item from '@/Cart/entities/Item';
import { getMappedCart } from './fetch-cart';

const handler = commonHandler.delete('/api/remove-item-from-cart', async (req, res) => {
  const cookies = new Cookies(req, res);
  const token = cookies.get('token');
  const cartId = cookies.get('cartId')!;
  // @ts-ignore
  const body = JSON.parse(req.body);

  const item: Item = { ...body.item, product: productFactory(body.item.product) };

  await removeItemFromCart(item, cookies.get('cartId')!, token);
  const cartResponse = await getMappedCart(cartId!, token);

  // @ts-ignore
  res.status(200).json(cartResponse);
  res.end();
});

export default handler;
