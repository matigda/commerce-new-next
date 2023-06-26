export default async function fetchTotals(cartId: string, token?: string) {
  const url = token ? '/carts/mine/totals' : `/guest-carts/${cartId}/totals`;

  const result = await fetch(`http://local-magento.com/rest/V1${url}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return await result.json();
}
