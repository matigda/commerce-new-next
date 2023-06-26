export default async function fetchPaymentMethods(cartId: string, token?: string) {
  const url = token
    ? `/carts/mine/payment-information`
    : `/guest-carts/${cartId}/payment-information`;

  const result = await fetch(`http://local-magento.com/rest/V1${url}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const json = await result.json();

  return json.payment_methods;
}
