import commonHandler from '../common';
import fetchCart from 'Magento/queries/fetchCart';
import Cookies from 'cookies';
import fetchProducts from 'Magento/queries/fetchProducts';
import fetchShippingMethods from 'Magento/queries/fetchShippingMethods';
import fetchTotals from 'Magento/queries/fetchTotals';
import { ProductI } from '@/Product/entities/Product';
import Item, { ItemStatus } from '@/Cart/entities/Item';
import mapMagentoAddresstoUISchema from 'Magento/mappers/mapMagentoAddresstoUISchema';
import {
  AddressSchema,
  CheckoutContextSchema,
  MagentoShippingMethodSchema,
  ServerCheckoutContextSchema
} from 'Checkout/stateMachines/CheckoutStateMachine';

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

  // @ts-ignore
  res.status(200).json(await getMappedCart(cartId, token));
  res.end();
});

export default handler;

const getMappedCart = async (
  cartId: string,
  token?: string
): Promise<ServerCheckoutContextSchema<MagentoShippingMethodSchema>> => {
  const data = await fetchCart(cartId, token);

  const magentoShippingAddress: any =
    data.extension_attributes.shipping_assignments[0]?.shipping.address;
  const magentoShippingMethod: any =
    data.extension_attributes.shipping_assignments[0]?.shipping.method;

  const shippingAddressIsAssigned = !!magentoShippingAddress?.email;

  // @TODO: if we have shipping methods in context we don't need to fetch them again - only when user adds something to cart or changes country
  const [products, shippingMethods, cartTotals] = await Promise.all([
    data.items.length > 0 ? fetchProducts({ skus: data.items.map((item: any) => item.sku) }) : [],
    fetchShippingMethods('PL', cartId, token),
    fetchTotals(cartId, token)
  ]);

  // @TODO: what if user has data in his profile? we need to override it
  const mappedShippingMethods = shippingMethods.map((method: any) => ({
    ...method,
    title: method.carrier_title
  }));

  return {
    shippingAddressIsAssigned,
    // the rest of it is state schema
    items: products.map((product: ProductI) => ({
      product,
      quantity: data.items.find((item: any) => item.sku === product.sku).qty,
      cartItemId: data.items.find((item: any) => item.sku === product.sku).item_id,
      status: ItemStatus.FRESH
    })),
    shipping: {
      ...mapMagentoAddresstoUISchema(magentoShippingAddress),

      // @TODO - make sure if it is ${carrier_code}_${method_code} or other way around
      shippingMethod: mappedShippingMethods.find(
        (method: MagentoShippingMethodSchema) =>
          magentoShippingMethod === `${method.carrier_code}_${method.method_code}`
      )
    },
    billing: {
      // @TODO - what if this is empty?
      ...mapMagentoAddresstoUISchema(data.billing_address)
    },
    totals: {
      tax: cartTotals.base_tax_amount,
      productsTotalPrice: cartTotals.subtotal_incl_tax,
      cartTotalPrice: cartTotals.base_grand_total,
      shippingCost: cartTotals.base_shipping_incl_tax,
      discount: cartTotals.discount_amount,
      couponCode: cartTotals.coupon_code
    },
    shippingMethods: mappedShippingMethods
  };
};

export { getMappedCart };
