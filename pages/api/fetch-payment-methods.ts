import commonHandler from './common';
import addProductToCart from 'Magento/commands/addProductToCart';
import Cookies from 'cookies';
import { productFactory, ProductType } from '@/Product/entities/Product';
import createCart from 'Magento/commands/createCart';
import assignShipping from 'Magento/commands/assignShipping';
import fetchPaymentMethods from 'Magento/queries/fetchPaymentMethods';

const handler = commonHandler.get('/api/fetch-payment-methods', async (req, res) => {
  const cookies = new Cookies(req, res);
  const token = cookies.get('token');

  const response = await fetchPaymentMethods(cookies.get('cartId')!, token);

  // @ts-ignore
  res.status(200).json(response);
  res.end();
});

export default handler;
