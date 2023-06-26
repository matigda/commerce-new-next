import mapProduct from '../mappers/mapProduct';
import createParametrizedUrl, { CONNECTORS } from '../utils/createParametrizedUrl';
import { ProductI } from 'Product/entities/Product';

type Params = {
  pageSize?: number;
  currentPage?: number;
  skus?: string[];
};

export default async function fetchProducts(params: Params): Promise<ProductI[]> {
  const { pageSize, currentPage, skus } = params;
  const paramsToFormatToMagentoUrl = [];

  if (skus) {
    paramsToFormatToMagentoUrl.push(
      ...skus.map((sku) => {
        return {
          field: 'sku',
          value: sku,
          condition_type: 'in',
          connector: CONNECTORS.OR
        };
      })
    );
  }

  if (pageSize) {
    paramsToFormatToMagentoUrl.push({ pageSize });
  }

  if (currentPage) {
    paramsToFormatToMagentoUrl.push({ currentPage });
  }

  const result = await fetch(
    createParametrizedUrl(
      'https://magento.demo.ecommerce-sii.com/rest/V1/products',
      paramsToFormatToMagentoUrl
    ),
    {
      headers: {
        Authorization: 'Basic c2lpOjEybWFnZW50bzM0'
      }
    }
  );

  const json = await result.json();

  return json.items.map(mapProduct);
}
