import {
  MagentoShippingMethodSchema,
  ShippingContextSchema
} from 'Checkout/stateMachines/CheckoutStateMachine';
import mapAddress from '../mappers/mapUIAddressToMagentoSchema';

export default async function assignShipping(
  cartId: string,
  shippingData: ShippingContextSchema<MagentoShippingMethodSchema>,
  token?: string
) {
  const url = token
    ? '/carts/mine/shipping-information'
    : `/guest-carts/${cartId}/shipping-information`;

  return await fetch(`http://local-magento.com/rest/V1${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      addressInformation: {
        billing_address: mapAddress(shippingData),
        shipping_address: mapAddress(shippingData),
        shipping_carrier_code: shippingData.shippingMethod!.carrier_code,
        shipping_method_code: shippingData.shippingMethod!.method_code
      }
    })
  }).then((response) =>
    response.json().then((data) => {
      if (!response.ok) {
        throw Error(data.err || 'HTTP error');
      }
      return data.payment_methods;
    })
  );
}
