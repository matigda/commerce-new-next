import commonHandler from './common';
import addProductToCart from 'Magento/commands/addProductToCart';
import Cookies from 'cookies';
import { productFactory, ProductType } from '@/Product/entities/Product';
import createCart from 'Magento/commands/createCart';
import assignShipping from 'Magento/commands/assignShipping';

const handler = commonHandler.post('/api/assign-shipping', async (req, res) => {
  const cookies = new Cookies(req, res);
  const token = cookies.get('token');

  // @ts-ignore
  const body = JSON.parse(req.body);

  const response = await assignShipping(cookies.get('cartId')!, body.shippingData, token);

  // @ts-ignore
  res.status(200).json(response);
  res.end();
});

export default handler;
