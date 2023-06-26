import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useLayoutEffect, useState } from 'react';
import { useCartQuery } from '../providers/CheckoutCommandQueryProvider';
function val(obj: any, x: any) {
  return x.split('.').reduce((o: any, i: any) => o && o[i], obj);
}

export default function usePaymentForm({ onSubmit }: { onSubmit?: (values: any) => void }) {
  const { cart, matches } = useCartQuery();
  const paymentMethods = cart?.paymentMethods!;

  const [enableReinitialize, setEnableReinitialize] = useState(true);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<number>();

  type FormValues = {
    paymentMethod: string;
  };

  const form = useFormik<FormValues>({
    validateOnBlur: false,
    validateOnChange: false,
    initialValues: {
      paymentMethod: ''
      // ...cart?.billing
    },
    onSubmit: (values: FormValues) => {
      if (onSubmit) {
        onSubmit(values);
      }
    },
    validationSchema: Yup.object().shape({
      paymentMethod: Yup.string().required('To pole jest wymagane')
    })
  });

  useLayoutEffect(() => {
    if (matches && !matches('main.master')) {
      setEnableReinitialize(false);
    }
  }, [cart]);

  const getPaymentMethodsProps = () => {
    const error = val(form.errors, 'paymentMethod');

    return {
      options: paymentMethods,
      onChange: (paymentMethod: any, index: number) => {
        setSelectedPaymentMethod(index);
        form.setFieldError('paymentMethod', undefined);
        form.setFieldValue('paymentMethod', paymentMethod);
      },
      controlProps: {
        error,
        selected: selectedPaymentMethod,
        onClick: (event: any, index: number) => setSelectedPaymentMethod(index)
      }
    };
  };

  return {
    getPaymentMethodsProps,
    form,
    isLoading: enableReinitialize,
    paymentMethods
  };
}
