import Product, { ProductType } from 'Product/entities/Product';

type Variant = {
  node: {
    priceV2: {
      currencyCode: string;
      amount: string;
    };
  };
};
type ShopifyProductResponse = {
  options: [];
  variants: {
    edges: Variant[];
  };
  sku: string;
  images: {
    edges: [];
  };
};

export default function mapProduct(response: ShopifyProductResponse): Product {
  const images = response.images.edges.map((image: any) => ({
    alt: image.node.altText,
    srcset: [
      { aspectRatio: 1, url: image.node.originalSrc, w: 500 },
      { aspectRatio: 1, url: image.node.transformedSrc, w: 500 }
    ]
  }));

  return {
    description: '',
    isDefault: false,
    name: '',
    urlIdentifier: '',
    ...response,
    options: response.options.map((option: any) => ({
      ...option,
      name: option.name.toLowerCase()
    })),
    type: ProductType.COMPLEX,
    price: {
      actualPrice: parseFloat(response.variants.edges[0].node.priceV2.amount),
      currency: response.variants.edges[0].node.priceV2.currencyCode
    },
    image: images[0],
    images,
    variants: response.variants.edges.map((node: any) => ({
      id: node.node.id,
      images,
      description: '',
      isDefault: false,
      name: '',
      urlIdentifier: '',
      type: ProductType.SIMPLE,
      options: response.options.map((option: any) => ({
        ...option,
        name: option.name.toLowerCase()
      })),
      pickedOptions: node.node.selectedOptions.map((option: any) => ({
        ...option,
        name: option.name.toLowerCase()
      })),
      image: images[0],
      sku: response.sku,
      price: {
        actualPrice: parseFloat(node.node.priceV2.amount),
        currency: node.node.priceV2.currencyCode
      }
    }))
    // additionalData: {
    //     handle
    // }
  };
}
