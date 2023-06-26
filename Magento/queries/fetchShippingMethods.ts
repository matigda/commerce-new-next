import { MagentoShippingMethodSchema } from 'Checkout/stateMachines/CheckoutStateMachine';

export default async function fetchShippingMethods(
  country: string,
  cartId: string,
  token?: string
) {
  const url = token
    ? '/carts/mine/estimate-shipping-methods'
    : `/guest-carts/${cartId}/estimate-shipping-methods`;

  const response = await fetch(`http://local-magento.com/rest/V1${url}`, {
    // I know it's query but there is no other way ( from what I know ) to fetch available shipping methods
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      address: {
        country_id: country
      }
    })
  });

  return (await response.json()) as MagentoShippingMethodSchema[];
}
