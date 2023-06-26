export default async function createCart(token?: string) {
  const url = token ? '/carts/mine' : '/guest-carts';

  const response = await fetch(`http://local-magento.com/rest/V1${url}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return await response.json();
}
