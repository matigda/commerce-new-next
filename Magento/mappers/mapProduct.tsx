import { ProductI, ProductType } from 'Product/entities/Product';

export default function mapProduct(magentoProductData: any): ProductI {
  const images = [
    {
      alt: '',
      srcset: [
        {
          aspectRatio: 1,
          url: `http://local-magento.com/media/catalog/product/cache/cff1831e076281abdbf1cd2ec3b023d7${magentoProductData.media_gallery_entries[0].file}`,
          w: 200
        }
      ]
    }
  ];

  return {
    composedProducts: magentoProductData.extension_attributes.bundle_product_options
      ? magentoProductData.extension_attributes.bundle_product_options.map(
          (productOption: any) => ({
            product: {
              sku: productOption.product_links[0].sku,
              name: productOption.title,
              id: productOption.option_id
            },
            quantity: productOption.product_links[0].qty
          })
        )
      : [],
    isDefault: magentoProductData.type_id === 'simple',
    price: {
      actualPrice: magentoProductData.price ?? 0,
      basePrice: 0,
      currency: 'PLN'
    },
    type:
      magentoProductData.type_id === 'simple'
        ? ProductType.SIMPLE
        : magentoProductData.type_id === 'configured'
        ? ProductType.COMPLEX
        : ProductType.COMPOSED,

    sku: magentoProductData.sku,
    urlIdentifier: magentoProductData.sku,
    name: magentoProductData.name,
    images: images,
    description: magentoProductData.custom_attributes.find(
      (attr: any) => attr.attribute_code == 'description'
    ).value,
    image: images[0],
    // price: {
    //     actualPrice: magentoProductData.price,
    //     currency: 'PLN'
    // },
    variants: [],
    options: []
  };
}
