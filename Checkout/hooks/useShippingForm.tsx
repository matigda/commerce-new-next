import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useCartQuery } from '../providers/CheckoutCommandQueryProvider';
import { useLayoutEffect, useState } from 'react';
import {
  MagentoShippingMethodSchema,
  ShippingContextSchema,
  ShippingMethodsType
} from '../stateMachines/CheckoutStateMachine';

function val(obj: any, x: any) {
  return x.split('.').reduce((o: any, i: any) => o && o[i], obj);
}

export default function useShippingForm<T extends ShippingMethodsType>({
  onSubmit
}: {
  onSubmit?: (values: ShippingContextSchema<ShippingMethodsType>) => void;
}) {
  const { cart, matches } = useCartQuery();
  const [enableReinitialize, setEnableReinitialize] = useState(true);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<number>();

  useLayoutEffect(() => {
    if (matches && !matches('main.master')) {
      setEnableReinitialize(false);
    }
  }, [cart]);

  const form = useFormik<ShippingContextSchema<ShippingMethodsType>>({
    validateOnBlur: false,
    validateOnChange: false,
    enableReinitialize,
    initialValues: {
      ...cart?.shipping
    },
    onSubmit: (values: ShippingContextSchema<ShippingMethodsType>) => {
      if (onSubmit) {
        onSubmit(values);
      }
    },
    validationSchema: Yup.object().shape({
      email: Yup.string().required('To pole jest wymagane').nullable(),
      shippingMethod: Yup.object().required('To pole jest wymagane'),
      firstname: Yup.string().required('To pole jest wymagane').nullable(),
      lastname: Yup.string().required('To pole jest wymagane').nullable(),
      street: Yup.string().required('To pole jest wymagane').nullable(),
      city: Yup.string().required('To pole jest wymagane').nullable(),
      country: Yup.string().required('To pole jest wymagane').nullable(),
      postCode: Yup.string().required('To pole jest wymagane').nullable(),
      phone: Yup.string().required('To pole jest wymagane').nullable()
    })
  });

  const getProps = (key: any) => {
    const error = val(form.errors, key);
    const value = val(form.values, key);
    return {
      inputProps: {
        name: key,
        error,
        helperText: error,
        value,
        onChange: (e: any) => {
          form.setFieldError(key, undefined);
          form.setFieldValue(key, e.target.value);
        }
      },
      controlProps: {
        error
      }
    };
  };

  const getShippingMethodsProps = () => {
    const error = val(form.errors, 'shippingMethod');

    return {
      options: cart!.shippingMethods
        ? (cart!.shippingMethods as MagentoShippingMethodSchema[])
        : [],
      onChange: (shippingMethod: MagentoShippingMethodSchema, index: number) => {
        setSelectedShippingMethod(index);
        form.setFieldError('shippingMethod', undefined);
        form.setFieldValue('shippingMethod', shippingMethod);
      },
      controlProps: {
        error,
        selected:
          typeof selectedShippingMethod !== 'undefined'
            ? selectedShippingMethod
            : cart!.shippingMethods?.findIndex(
                (method: ShippingMethodsType) =>
                  JSON.stringify(cart!.shipping!.shippingMethod) === JSON.stringify(method)
              ), //@TODO - przypisz wybraną metodę
        onClick: (event: any, index: number) => {
          setSelectedShippingMethod(index);
        }
      }
    };
  };

  return {
    getShippingMethodsProps,
    form,
    getProps,
    isLoading: enableReinitialize
  };
}
