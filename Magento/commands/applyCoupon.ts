export default async function applyCoupon(couponCode: string, cartId: string, token?: string) {
  const url = token
    ? `/carts/mine/coupons/${couponCode}`
    : `/guest-carts/${cartId}/coupons/${couponCode}`;

  return await fetch(`http://local-magento.com/rest/V1${url}`, {
    method: 'PUT',
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
