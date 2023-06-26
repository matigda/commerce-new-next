import commonHandler from '../common';
import Cookies from 'cookies';
import { productFactory } from 'Product/entities/Product';
import removeItemFromCart from 'Shopify/commands/removeItemFromCart';
import Item from 'Cart/entities/Item';
import { mapCart } from '../../../Shopify/mappers/mapCart';

const handler = commonHandler.delete('/api/remove-item-from-cart', async (req, res) => {
  const cookies = new Cookies(req, res);
  // @ts-ignore
  const body = JSON.parse(req.body);
  const item: Item = { ...body.item, product: productFactory(body.item.product) };

  const response = await removeItemFromCart(item, cookies.get('cartId')!);

  const cart = mapCart(response.checkoutLineItemsRemove);

  // @ts-ignore
  res.status(200).json(cart);
  res.end();
});

export default handler;
