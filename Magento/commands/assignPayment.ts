import { BillingContextSchema } from 'Checkout/stateMachines/CheckoutStateMachine';
import mapAddress from '../mappers/mapUIAddressToMagentoSchema';

export default async function assignPayment(
  billingData: BillingContextSchema,
  paymentMethod: string,
  cartId: string,
  token?: string
) {
  const url = token
    ? '/carts/mine/payment-information'
    : `/guest-carts/${cartId}/payment-information`;

  return await fetch(`http://local-magento.com/rest/V1${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      email: billingData.email,
      billing_address: mapAddress(billingData),
      paymentMethod: {
        method: paymentMethod
      }
    })
  }).then((response) =>
    response.json().then((data) => {
      if (!response.ok) {
        throw Error(data.err || 'HTTP error');
      }
      return data;
    })
  );
}
