import commonHandler from './common';
import Cookies from 'cookies';
import ProductI, { productFactory, ProductType } from 'Product/entities/Product';
import createCart from 'Shopify/commands/createCart';
import {
  ServerCheckoutContextSchema,
  ShopifyShippingMethodSchema
} from 'Checkout/stateMachines/CheckoutStateMachine';
import Item, { ItemStatus, ServerItem } from 'Cart/entities/Item';
import mapImage from 'Shopify/mappers/mapImage';
import addProductToCart from 'Shopify/commands/addProductToCart';
import { mapCart } from '../../Shopify/mappers/mapCart';
import { NextRequest } from 'next/server';

const promise = (ms: number, data: any) => {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
};

export default async function handler(req: NextRequest, res) {
  const cookies = new Cookies(req, res);
  // const token = cookies.get('token');
  // let cartId = cookies.get('cartId');

  const cartId = req.cookies.get('cartId')?.value,
    token = req.cookies.get('token')?.value;

  // @ts-ignore
  const body = JSON.parse(req.body);
  let cart: ServerCheckoutContextSchema<ShopifyShippingMethodSchema>;

  // await promise(3000, {});
  if (!cartId) {
    const response = await createCart(productFactory(body.product), body.quantity);
    cart = mapCart(response.checkoutCreate);
    cookies.set('cartId', response.checkoutCreate.checkout.id);
  } else {
    const response = await addProductToCart(productFactory(body.product), body.quantity, cartId);
    cart = mapCart(response.checkoutLineItemsAdd);
  }

  // await addProductToCart(productFactory(body.product), body.quantity, cartId!, token);
  // const cartResponse = await getMappedCart(cartId!, token);

  // @ts-ignore
  res.status(200).json(cart || {});
  res.end();
}
