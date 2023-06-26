export default async function fetchCart(cartId: string, token?: string) {
  const url = token ? '/carts/mine' : `/guest-carts/${cartId}`;

  const result = await fetch(`http://local-magento.com/rest/V1${url}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return await result.json();
}
