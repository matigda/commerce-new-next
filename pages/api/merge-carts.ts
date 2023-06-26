import commonHandler from './common';
import { SerializedItem } from '@/Cart/entities/Item';
import addProductToCart from 'Magento/commands/addProductToCart';
import createCart from 'Magento/commands/createCart';
import Cookies from 'cookies';
import { productFactory } from '@/Product/entities/Product';

const handler = commonHandler.post('/api/merge-carts', async (req, res) => {
  const cookies = new Cookies(req, res);
  const token = cookies.get('token');

  // @ts-ignore
  const body = JSON.parse(req.body);
  const customerCartId = (await createCart(token)) as string;

  await Promise.all(
    body.items.map((item: SerializedItem) =>
      addProductToCart(productFactory(item.product), item.quantity, customerCartId, token)
    )
  );

  cookies.set('cartId', customerCartId, {
    httpOnly: true,
    sameSite: 'lax'
  });

  // @ts-ignore
  res.status(200).json({ message: 'elos' });
  res.end();
});

export default handler;
