import commonHandler from './common';
import Cookies from 'cookies';
const handler = commonHandler.get('/api/reset', async (req, res) => {
  const cookies = new Cookies(req, res);
  cookies.set('cartId');
  cookies.set('token');

  // @ts-ignore
  res.status(200).json({});
  res.end();
});

export default handler;
