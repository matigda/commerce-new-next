import React, { FunctionComponent, useContext } from 'react';

interface CurrencyProps {
  currencyCode: string;
  currencySymbol: string;
}
const CurrencyContext = React.createContext<Partial<CurrencyProps>>({});

const CurrencyProvider: FunctionComponent<CurrencyProps> = ({
  currencySymbol,
  currencyCode,
  children
}) => {
  return (
    <CurrencyContext.Provider
      value={{
        currencyCode,
        currencySymbol
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

const useCurrency = () => {
  return useContext(CurrencyContext);
};

export { useCurrency };

export default CurrencyProvider;
