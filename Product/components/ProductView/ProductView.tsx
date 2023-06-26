import React, { FC, SyntheticEvent, useState } from 'react';
import cn from 'classnames';
import { NextSeo } from 'next-seo';

import s from './ProductView.module.css';
import { useUI } from '@Core/components/context';
import { ProductSlider, Swatch } from '@Product/components';
import { Button, Container, HTMLContent } from '@Core/components';

import {
  ComposedProduct,
  Option,
  PickedOption,
  ProductMethods,
  ProductType,
  ProductWithVariants
} from 'Product/entities/Product';
import EnhancedImage from '@Core/components/EnhancedImage';
import { useCartCommand } from 'Checkout/providers/CheckoutCommandQueryProvider';

interface Props {
  className?: string;
  children?: any;
  product: ProductMethods;
}

const ProductView: FC<Props> = ({ product }) => {
  if (product.getProductType() === ProductType.COMPOSED) {
    return ComposedProductView(product as ComposedProduct);
  }

  const { addProduct = (product: ProductMethods) => {} } = useCartCommand();
  const { openSidebar } = useUI();

  const [loading, setLoading] = useState(false);

  const [choices, setChoices] = useState<
    PickedOption[] | ((currentChoices: PickedOption[]) => PickedOption[]) | undefined
  >(
    product.getAvailableOptions()?.reduce((acc: PickedOption[], curr: Option): PickedOption[] => {
      acc.push({ name: curr.name, value: '' });
      return acc;
    }, [])
  );

  const addToCart = async () => {
    setLoading(true);
    addProduct(product, 1);
    openSidebar();
    setLoading(false);
  };

  return (
    <Container className="w-full max-w-none" clean>
      <NextSeo
        title={product.getName()}
        description={product.getDescription()}
        openGraph={{
          type: 'website',
          title: product.getName(),
          description: product.getDescription(),
          images: [
            {
              url: product.getImages()[0]?.srcset[0].url,
              width: 800,
              height: 600,
              alt: product.getName()
            }
          ]
        }}
      />
      <div className={cn(s.root, 'fit')}>
        <div className={cn(s.productDisplay, 'fit')}>
          <div className={s.nameBox}>
            <h1 className={s.name}>{product.getName()}</h1>
            <div className={s.price}>
              {product.getPrice().actualPrice}
              {` `}
              {product.getPrice().currency}
            </div>
          </div>

          <div className={s.sliderContainer}>
            <ProductSlider>
              {product.getImages()?.map((image, i) => (
                <div key={i} className={s.imageContainer}>
                  <EnhancedImage
                    image={image}
                    src={image.srcset[0].url}
                    alt={image.alt || 'Product Image'}
                    width={1050}
                    height={1050}
                    priority={i === 0}
                    quality="85"
                  />
                </div>
              ))}
            </ProductSlider>
          </div>
        </div>

        <div className={s.sidebar}>
          <section>
            {product.getAvailableOptions()?.map((opt) => (
              <div className="pb-4" key={opt.name}>
                <h2 className="font-medium uppercase">{opt.name}</h2>
                <div className="flex flex-row py-4">
                  {opt.values.map((v: any, i: number) => {
                    return (
                      <Swatch
                        key={`${v}-${i}`}
                        active={
                          (choices as PickedOption[])!.find((choice) => choice.name === opt.name)!
                            .value === v
                        }
                        optionName={opt.name}
                        color={opt.name === 'color' ? v : ''}
                        label={v}
                        onClick={() => {
                          setChoices((currentChoices: PickedOption[]) => {
                            const newChoice = currentChoices.find((el) => el.name === opt.name);
                            newChoice!.value = v;
                            const newChoices = [
                              ...currentChoices.filter((el) => el.name !== opt.name),
                              newChoice
                            ] as PickedOption[];

                            (product as ProductWithVariants).selectOptions(newChoices);

                            return newChoices;
                          });
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="w-full max-w-xl break-words pb-14">
              <HTMLContent html={product.getDescription()!} />
            </div>
          </section>
          <div>
            <Button
              aria-label="Add to Cart"
              type="button"
              className={s.button}
              onClick={addToCart}
              loading={loading}
              disabled={!(product as ProductWithVariants).isConfigured()}
            >
              Add to Cart
            </Button>
          </div>
        </div>

        {/*<WishlistButton*/}
        {/*  className={s.wishlistButton}*/}
        {/*  productId={product.entityId}*/}
        {/*  variant={product.variants.edges?.[0]!}*/}
        {/*/>*/}
      </div>
    </Container>
  );
};

const ComposedProductView = (product: ComposedProduct) => {
  const [update, setUpdate] = useState(false);
  const { addProduct = (product: ProductMethods) => {} } = useCartCommand();

  const addToCart = async () => {
    let clone = Object.assign(Object.create(Object.getPrototypeOf(product)), product);

    // setLoading(true)
    addProduct(clone, 1);
    // openSidebar()
    // setLoading(false)
  };

  const test = (e: SyntheticEvent) => {
    // @ts-ignore
    product.updateProductQuantity(e.target.name, parseInt(e.target.value));
    setUpdate(!update);
  };

  return (
    <div>
      {product.getProducts().map((prod) => (
        <div>
          {prod.product.sku}{' '}
          <input onChange={test} type={'number'} name={prod.product.sku} value={prod.quantity} />
        </div>
      ))}
      <Button aria-label="Add to Cart" type="button" className={s.button} onClick={addToCart}>
        Add to Cart
      </Button>
      tu wrzucimy rzeczy związane z composed productem
    </div>
  );
};

export default ProductView;
