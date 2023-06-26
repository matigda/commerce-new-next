import commonHandler from '../common';
import fetchCart from '@Shopify/queries/fetchCart';
import Cookies from 'cookies';
import fetchProducts from '@Magento/queries/fetchProducts';
import fetchShippingMethods from '@Magento/queries/fetchShippingMethods';
import fetchTotals from '@Magento/queries/fetchTotals';
import { ProductI, ProductType } from '@Product/entities/Product';
import Item, { ItemStatus, ServerItem } from '@Cart/entities/Item';
import mapMagentoAddresstoUISchema from '@Magento/mappers/mapMagentoAddresstoUISchema';
import {
  AddressSchema,
  CheckoutContextSchema,
  MagentoShippingMethodSchema,
  ServerCheckoutContextSchema,
  ShopifyShippingMethodSchema
} from '@Checkout/stateMachines/CheckoutStateMachine';
import mapImage from '@Shopify/mappers/mapImage';
import { mapCart } from '../../../Shopify/mappers/mapCart';

const handler = commonHandler.get('/api/fetch-cart', async (req, res) => {
  const cookies = new Cookies(req, res);
  const cartId = cookies.get('cartId')!,
    token = cookies.get('token');

  if (!cartId) {
    // @ts-ignore
    res.status(200).json({});
    res.end();
    return;
  }

  const response = await fetchCart(cartId, token);

  // @ts-ignore
  res.status(200).json(mapCart(response));
  res.end();
});

export default handler;
