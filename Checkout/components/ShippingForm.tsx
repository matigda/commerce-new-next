import React, { FormEvent } from 'react';
import Input from './Input';
import { useRouter } from 'next/router';
import useShippingForm from '../hooks/useShippingForm';
import { MagentoShippingMethodSchema } from '../stateMachines/CheckoutStateMachine';
import { useCartCommand } from '../providers/CheckoutCommandQueryProvider';
import Button from '@Core/components/Button';

export default function ShippingForm() {
  const { assignShipping = () => {} } = useCartCommand();

  const Router = useRouter();

  const { form, getProps, getShippingMethodsProps, isLoading } =
    useShippingForm<MagentoShippingMethodSchema>({
      onSubmit: (values) => {
        assignShipping(values);
        Router.push('/payment');
      }
    });

  return (
    <form onSubmit={(event: FormEvent<any>) => form.handleSubmit(event)}>
      <h2>Adres wysyłki</h2>

      {isLoading ? (
        'Loading...'
      ) : (
        <>
          <Input {...getProps('email').inputProps} placeholder={'E-mail'} />
          <div className={'grid grid-cols-2'}>
            <Input {...getProps('firstname').inputProps} placeholder={'Imię'} />
            <Input {...getProps('lastname').inputProps} placeholder={'Nazwisko'} />
          </div>
          <Input {...getProps('street').inputProps} placeholder={'Ulica'} />
          <Input {...getProps('city').inputProps} placeholder={'Miasto'} />
          <Input {...getProps('country').inputProps} placeholder={'Państwo'} />
          <Input {...getProps('postCode').inputProps} placeholder={'Kod pocztowy'} />
          <Input {...getProps('phone').inputProps} placeholder={'Telefon'} />

          <h2>Sposób wysyłki</h2>

          {getShippingMethodsProps().options.map((option, index) => (
            <Button
              type={'button'}
              variant={
                getShippingMethodsProps().controlProps.selected === index ? 'flat' : 'outline'
              }
              onClick={() => {
                getShippingMethodsProps().onChange(option, index);
              }}
            >
              {option.title}
            </Button>
          ))}

          <div className={'mt-40 grid grid-cols-2'}>
            <Button variant={'outline'} onClick={() => history.go(-1)}>
              Wróć do zakupów
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
  );
}
