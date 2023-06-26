import mapCart from 'Magento/mappers/mapCart';

export default async function fetchCart() {
  const response = await fetch('/api/fetch-cart');

  const json = await response.json();

  return mapCart(json);
}
