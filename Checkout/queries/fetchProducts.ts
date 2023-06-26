export default async function fetchProducts() {
  const response = await fetch('/api/fetch-products');

  return response.json();
}
