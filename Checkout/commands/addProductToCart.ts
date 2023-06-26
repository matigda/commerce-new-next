import { ProductMethods } from 'Product/entities/Product';

export default async function addProductToCart(product: ProductMethods, quantity: number) {
  const response = await fetch('/api/add-product', {
    method: 'POST',
    body: JSON.stringify({
      product: product.getProduct(),
      quantity
    })
  });

  return await response.json();
}
