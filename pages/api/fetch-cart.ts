import commonHandler from './common';
import fetchCart from 'Shopify/queries/fetchCart';
import Cookies from 'cookies';
import { mapCart } from '../../Shopify/mappers/mapCart';
import { NextRequest } from 'next/server';

export const config = {
  runtime: 'edge'
};

export default async function handler(req: NextRequest, res) {
  // const cookies = new Cookies(req, res)
  // const cartId = cookies.get('cartId')!,
  //     token = cookies.get('token');

  const cartId = req.cookies.get('cartId')?.value,
    token = req.cookies.get('token')?.value;

  if (!cartId) {
    // @ts-ignore
    return new Response(JSON.stringify({}), {
      status: 200,
      headers: {
        'content-type': 'application/json'
      }
    });
  }
  const response = await fetchCart(cartId, token);

  return new Response(JSON.stringify(mapCart(response.body.data)), {
    status: 200,
    headers: {
      'content-type': 'application/json'
    }
  });
  // @ts-ignore
  // return res.json(mapCart(response))
}

// export default handler;
