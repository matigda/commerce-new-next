export default async function removeCoupon(cartId: string, token?: string) {
  const url = token ? `/carts/mine/coupons` : `/guest-carts/${cartId}/coupons`;

  return await fetch(`http://local-magento.com/rest/V1${url}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  }).then((response) =>
    response.json().then((data) => {
      if (!response.ok) {
        throw Error(data.err || 'HTTP error');
      }
      return data.payment_methods;
    })
  );
}
