import commonHandler from './common';
import Cookies from 'cookies';

const handler = commonHandler.post('/api/login', async (req, res) => {
  const token = await fetch(`http://local-magento.com/rest/V1/integration/customer/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },

    // @ts-ignore
    body: JSON.stringify(req.body)
  }).then((response) =>
    response.json().then((data) => {
      if (!response.ok) {
        throw Error(data.err || data.message || 'HTTP error');
      }
      return data;
    })
  );

  const cookies = new Cookies(req, res);
  cookies.set('token', token, {
    httpOnly: true,
    sameSite: 'lax'
  });

  // @ts-ignore
  res.status(200).json({ message: 'elo login' });
  res.end();
});

export default handler;
