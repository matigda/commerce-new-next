import commonHandler from './common';
import Cookies from 'cookies';
import assignPayment from 'Magento/commands/assignPayment';

const handler = commonHandler.post('/api/assign-payment', async (req, res) => {
  const cookies = new Cookies(req, res);
  const token = cookies.get('token');

  // @ts-ignore
  const body = JSON.parse(req.body);

  console.log(cookies.get('cartId'));

  const response = await assignPayment(
    body.billingData,
    body.paymentMethod,
    cookies.get('cartId')!,
    token
  );

  cookies.set('cartId');

  // @ts-ignore
  res.status(200).json(response);
  res.end();
});

export default handler;
