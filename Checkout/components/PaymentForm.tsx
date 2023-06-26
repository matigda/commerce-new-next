import React, { FormEvent } from 'react';
import { useCartCommand } from '../providers/CheckoutCommandQueryProvider';
import usePaymentForm from '../hooks/usePaymentForm';
import Button from '@Core/components/Button';
import { useRouter } from 'next/router';

export default function PaymentForm() {
  const { assignPayment = () => {} } = useCartCommand();

  const Router = useRouter();

  const { form, isLoading, paymentMethods, getPaymentMethodsProps } = usePaymentForm({
    onSubmit: (values) => {
      assignPayment(values);
      Router.push('/thank-you');
    }
  });

  return (
    <React.Fragment>
      <form onSubmit={(event: FormEvent<any>) => form.handleSubmit(event)}>
        <h2>Payment method</h2>
        {isLoading || !paymentMethods ? (
          'Loading...'
        ) : (
          <>
            {getPaymentMethodsProps().options.map((method: any, index) => {
              return (
                <Button
                  variant={
                    getPaymentMethodsProps().controlProps.selected === index ? 'flat' : 'outline'
                  }
                  onClick={() => {
                    getPaymentMethodsProps().onChange(method, index);
                  }}
                >
                  {method.title}
                </Button>
              );
            })}

            <div className={'mt-40 grid grid-cols-2'}>
              <Button variant={'outline'} onClick={() => history.go(-1)}>
                Wróć do poprzedniej strony
              </Button>

              <Button
                type={'submit'}
                onClick={(e) => {
                  // e.preventDefault();
                  // form.submitForm();
                }}
              >
                Submit
              </Button>
            </div>
          </>
        )}
      </form>
    </React.Fragment>
  );
}
