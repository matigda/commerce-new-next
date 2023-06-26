import { productFactory } from 'Product/entities/Product';

export default function mapCart(json: any) {
  return {
    ...json,
    items: json.items
      ? json.items.map((item: any) => ({
          ...item,
          product: productFactory(item.product)
        }))
      : []
  };
}
