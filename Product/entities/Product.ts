interface ImageVariant {
  aspectRatio: number;
  url: string;
  w: number;
}

export interface Image {
  alt: string;
  srcset: ImageVariant[];
}

interface Price {
  promotionPrice?: number;
  basePrice?: number;
  actualPrice: number;
  currency: string;
}

export interface Option {
  name: string;
  values: string[];
}

export interface PickedOption {
  name: string;
  value: string | number;
}

export enum ProductType {
  SIMPLE,
  COMPLEX,
  COMPOSED
}
export interface BaseProductData {
  id?: string | number;
  sku: string;
  name: string;
  description: string;
  urlIdentifier: string;
  type: ProductType;
  image: Image;
  images: Image[];
}

export interface ComposedProductI {
  // @ts-ignore
  product: ProductI;
  quantity: number;
}

export interface ProductI extends BaseProductData {
  isDefault: boolean;
  price: Price;
  variants?: ProductI[];
  options?: Option[];
  pickedOptions?: PickedOption[];
  composedProducts?: ComposedProductI[];
}

export interface ProductMethods {
  getId(): string | number | undefined;
  getImages(): Image[];
  getSku(): string;
  getUrlIdentifier(): string;
  getProductType(): ProductType;
  getPrice(): Price;
  getName(): string;
  getDescription(): string;
  getAvailableOptions(): Option[] | undefined;
  getProduct(): ProductI;
}

interface State {
  pickedOptions: PickedOption[];
}

export abstract class ProductWithVariants implements ProductMethods {
  protected variants: ProductWithVariants[];
  protected product: ProductI;
  protected state: State = {
    pickedOptions: []
  };

  constructor(product: ProductI) {
    this.product = product;
    this.variants =
      product.variants?.map(
        (product) =>
          productFactory(
            product
          ) as ProductWithVariants /* we can set that, because Composed product will never be inside Simple/Complex/Composed */
      ) ?? [];

    this.state.pickedOptions = product.pickedOptions || [];
  }

  selectOptions(pickedOptions: PickedOption[]) {
    this.state.pickedOptions = pickedOptions;

    const variants: ProductWithVariants[] = [
      this,
      ...this.variants!,
      ...this.variants.map((variant) => variant.getVariants()).flat()
    ];

    const pickedOptionsJSON = JSON.stringify(this.state.pickedOptions.sort());

    const variant = variants.find((variant) => {
      variant.setDefault(false);
      return pickedOptionsJSON === JSON.stringify(variant.getPickedOptions()?.sort());
    });
    if (variant) {
      variant.setDefault(true);
    }
  }

  getId() {
    return this.product.id;
  }

  getAvailableOptions(): Option[] | undefined {
    return this.product.options;
  }

  getUrlIdentifier(): string {
    const pickedVariant = this.getPickedVariant();

    if (pickedVariant === null || this.product.isDefault) {
      return this.product.urlIdentifier;
    }

    return pickedVariant.getUrlIdentifier();
  }

  isConfigured(): boolean {
    return this.getPickedVariant() !== null;
  }

  getPrice(): Price {
    const pickedVariant = this.getPickedVariant();

    if (!pickedVariant || this.product.isDefault) {
      return this.product.price;
    }

    return pickedVariant.getPrice();
  }

  setDefault(isDefault: boolean) {
    this.product.isDefault = isDefault;
  }

  getDescription(): string {
    return this.product.description ?? '';
  }

  getPickedOptions(): PickedOption[] | undefined {
    return this.product.pickedOptions;
  }

  isDefault(): boolean {
    return this.product.isDefault;
  }

  getVariants(): ProductWithVariants[] {
    return this.variants;
  }

  getName(): string {
    return this.product.name;
  }

  getSku(): string {
    return this.product.sku;
  }

  getProduct(): ProductI {
    return this.product;
  }

  abstract getImages(): Image[];
  abstract getProductType(): ProductType;
  abstract getPickedVariant(): ProductWithVariants | null;
}

const useImages = (product: ProductI) => {};

export class ComplexProduct extends ProductWithVariants {
  getImages(): Image[] {
    const pickedVariant = this.getPickedVariant();

    if (pickedVariant) {
      return pickedVariant.getImages();
    }

    if (this.state.pickedOptions.length) {
      let variants = this.variants!;
      this.state.pickedOptions.forEach((option) => {
        variants = variants.filter((variant) => {
          const pickedOption = variant
            .getPickedOptions()!
            .find((pickedOption) => pickedOption.name === option.name);
          return pickedOption!.value === option.value;
        });
      });

      return variants.map((variant) => variant.getImages()).flat();
    }

    return this.product.images.concat(this.variants!.map((variant) => variant.getImages()).flat());
  }

  getProductType(): ProductType {
    return ProductType.COMPLEX;
  }

  getPickedVariant(): ProductWithVariants | null {
    // @TODO - make sure this second condition actually makes sense
    return (
      this.variants!.find((variant) => variant.isDefault()) ||
      this.variants!.find((variant) => variant.getPickedVariant()) ||
      null
    );
  }
}

export class SimpleProduct extends ProductWithVariants {
  getImages(): Image[] {
    if (this.product.isDefault) {
      return this.product.images;
    }

    const pickedVariant = this.getPickedVariant();
    if (pickedVariant) {
      return pickedVariant.getImages();
    }

    return this.product.images;
  }

  getProductType(): ProductType {
    return ProductType.SIMPLE;
  }

  getPickedVariant(): ProductWithVariants | null {
    return this.product.isDefault
      ? this
      : this.variants!.find((variant) => variant.isDefault()) || null;
  }
}

export class ComposedProduct implements ProductMethods {
  private products: ComposedProductI[];
  private product: ProductI;

  constructor(product: ProductI) {
    this.product = product;
    this.products = product.composedProducts!;
  }

  getImages(): Image[] {
    return this.product.images;
  }

  getName(): string {
    return this.product.name;
  }

  getPrice(): Price {
    return {
      actualPrice: 2,
      currency: 'PLN'
    };
  }

  getProductType(): ProductType {
    return ProductType.COMPOSED;
  }

  getSku(): string {
    return this.product.sku;
  }

  getUrlIdentifier(): string {
    return this.product.urlIdentifier;
  }

  getAvailableOptions(): Option[] | undefined {
    return [];
  }

  getDescription(): string {
    return this.product.description;
  }

  updateProductQuantity(sku: string, quantity: number) {
    const productToUpdate = this.products.find((item) => item.product.sku === sku);
    if (!productToUpdate) {
      throw Error(`There is no inner product with sku "${sku}"`);
    }
    productToUpdate.quantity = quantity;
  }

  getProducts(): ComposedProductI[] {
    return this.products;
  }

  getProduct(): ProductI {
    return this.product;
  }

  getId() {
    return this.product.id;
  }
}

/**
 * !!!!!!!!!!!
 * PRODUKT W KOSZYKU MA JUŻ KONKRETNĄ CENE! ZAWSZE
 * PRODUKT NA STRONIE MOŻE MIEĆ PRZEDZIAŁ
 *
 *
 * PRODUKT JAKO MASZYNA STANÓW
 * 1. jak jest dodany do koszyka to jego cena jest konkretna
 * 2. jak nie ma odpowiedzi z backendu to nie można go usunąć z koszyka
 *
 *
 * varianty - simple product może je mieć
 * complex product musi je mieć
 * co z composed? simple product ma wybrany variant, ale complex już niekoniecznie
 */

const useComplexProduct = () => {};

const useComposedProduct = () => {};

export const useProducts = (productTuples: ProductI[]): ProductMethods[] => {
  return productTuples.map(productFactory);
};

export const productFactory = (productTuple: ProductI): ProductMethods => {
  if (productTuple.type === ProductType.SIMPLE) {
    return new SimpleProduct(productTuple);
  }

  if (productTuple.type === ProductType.COMPLEX) {
    return new ComplexProduct(productTuple);
  }

  return new ComposedProduct(productTuple);
};

export default ProductI;
