import ProductI, { ProductType } from './Product/entities/Product';

const images = [
  {
    alt: 'Yellow jacket image xl',
    srcset: [{ url: '/yellow-jacket-xl-image', aspectRatio: 0.71, w: 3 }]
  },
  {
    alt: 'Yellow jacket image l',
    srcset: [{ url: '/yellow-jacket-l-image', aspectRatio: 0.71, w: 3 }]
  },
  {
    alt: 'Green jacket image l',
    srcset: [{ url: '/green-jacket-l-image', aspectRatio: 0.71, w: 3 }]
  },
  {
    alt: 'Green jacket image Xl',
    srcset: [{ url: '/green-jacket-xl-image', aspectRatio: 0.71, w: 3 }]
  },
  {
    alt: 'Red jacket image Xl',
    srcset: [{ url: '/red-jacket-xl-image', aspectRatio: 0.71, w: 3 }]
  },
  {
    alt: 'Red jacket image l',
    srcset: [{ url: '/green-jacket-l-image', aspectRatio: 0.71, w: 3 }]
  },
  {
    alt: 'Yellow jacket image s',
    srcset: [{ url: '/yellow-jacket-s-image', aspectRatio: 0.71, w: 3 }]
  }
];
const options = [
  { name: 'size', values: ['xl', 'l', 's'] },
  { name: 'color', values: ['red', 'yellow'] }
];

const redJacketXL: ProductI = {
  sku: 'red-jacket-XL',
  name: 'Red jacket size XL',
  isDefault: false,
  urlIdentifier: 'red-jacket-xl',
  type: ProductType.SIMPLE,
  description: 'Description for the red jacket size XL',
  image: images[4],
  images: [images[4]],
  price: {
    actualPrice: 9,
    basePrice: 13,
    currency: 'PLN'
  },
  options,
  pickedOptions: [
    { name: 'color', value: 'red' },
    { name: 'size', value: 'xl' }
  ]
};
const redJacketL: ProductI = {
  sku: 'red-jacket-L',
  name: 'Red jacket size L',
  isDefault: false,
  urlIdentifier: 'red-jacket-l',
  type: ProductType.SIMPLE,
  description: 'Description for the red jacket size L',
  image: images[5],
  images: [images[5]],
  price: {
    actualPrice: 19,
    basePrice: 23,
    currency: 'PLN'
  },
  options,
  pickedOptions: [
    { name: 'color', value: 'red' },
    { name: 'size', value: 'l' }
  ]
};

const yellowJacketXL: ProductI = {
  sku: 'yellow-jacket-XL',
  name: 'Yellow jacket size XL',
  isDefault: false,
  urlIdentifier: 'yellow-jacket-xl',
  type: ProductType.SIMPLE,
  description: 'Description for the yellow jacket size XL',
  image: images[0],
  images: [images[0]],
  price: {
    actualPrice: 8,
    basePrice: 22,
    currency: 'PLN'
  },
  options,
  pickedOptions: [
    { name: 'color', value: 'yellow' },
    { name: 'size', value: 'xl' }
  ]
};

const yellowJacketS: ProductI = {
  sku: 'yellow-jacket-S',
  name: 'Yellow jacket size S',
  isDefault: false,
  urlIdentifier: 'yellow-jacket-S',
  type: ProductType.SIMPLE,
  description: 'Description for the yellow jacket size S',
  image: images[6],
  images: [images[6]],
  price: {
    actualPrice: 8,
    basePrice: 22,
    currency: 'PLN'
  },
  options,
  pickedOptions: [
    { name: 'color', value: 'yellow' },
    { name: 'size', value: 's' }
  ]
};

const yellowJacketL: ProductI = {
  sku: 'yellow-jacket-L',
  name: 'Yellow jacket size L',
  isDefault: false,
  urlIdentifier: 'yellow-jacket-l',
  type: ProductType.SIMPLE,
  description: 'Description for the yellow jacket size L',
  image: images[1],
  images: [images[1]],
  price: {
    actualPrice: 10,
    basePrice: 12,
    currency: 'PLN'
  },
  options,
  pickedOptions: [
    { name: 'color', value: 'yellow' },
    { name: 'size', value: 'l' }
  ]
};

const jacket: ProductI = {
  sku: 'jacket',
  name: 'jacket',
  isDefault: false,
  urlIdentifier: 'jacket',
  type: ProductType.COMPLEX,
  description: 'Description for the jacket',
  image: images[0],
  images: [],
  price: {
    actualPrice: 10,
    basePrice: 12,
    currency: 'PLN'
  },
  options,
  variants: [yellowJacketXL, yellowJacketL, redJacketXL, redJacketL]
  // pickedOptions: [{name: 'color', value: 'yellow'}, {name: "size", value: "xl"}]
};

const redJacket: ProductI = {
  sku: 'red-jacket',
  name: 'red-jacket',
  isDefault: false,
  urlIdentifier: 'red-jacket',
  type: ProductType.COMPLEX,
  description: 'Description for the red jacket',
  image: images[0],
  images: [],
  price: {
    actualPrice: 101,
    basePrice: 123,
    currency: 'PLN'
  },
  options,
  variants: [redJacketXL, redJacketL],
  pickedOptions: [{ name: 'color', value: 'red' }]
};

const yellowJacket: ProductI = {
  sku: 'yellow-jacket',
  name: 'yellow-jacket',
  isDefault: false,
  urlIdentifier: 'yellow-jacket',
  type: ProductType.COMPLEX,
  description: 'Description for the yellow jacket',
  image: images[0],
  images: [],
  price: {
    actualPrice: 104,
    basePrice: 16,
    currency: 'PLN'
  },
  options,
  variants: [yellowJacketXL, yellowJacketL, redJacket],
  pickedOptions: [{ name: 'color', value: 'yellow' }]
};

export {
  jacket,
  yellowJacketL,
  yellowJacketXL,
  redJacketXL,
  redJacketL,
  yellowJacket,
  redJacket,
  yellowJacketS
};
