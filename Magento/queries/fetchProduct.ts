import fetchProducts from 'Magento/queries/fetchProducts';
import Product from 'Product/entities/Product';

export default async function fetchProduct(sku: string): Promise<Product> {
  const products = await fetchProducts({ skus: [sku] });

  return products[0];
}
