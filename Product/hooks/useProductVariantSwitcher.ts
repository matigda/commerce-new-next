import { PickedOption, ProductType, ProductWithVariants } from '../entities/Product';
import { useState } from 'react';

export enum OptionLevel {
  OPTIONAL,
  FORCED
}

export interface Option {
  name: string;
  importance: OptionLevel;
}

export default function useProductVariantSwitcher(
  product: ProductWithVariants,
  options?: Option[]
) {
  const [state, setState] = useState({
    availableOptions: product.getAvailableOptions()!.map((option) => ({
      name: option.name,
      values: option.values.map((value) => ({
        value,
        available: true,
        picked: false
      }))
    })),

    pickedOptions: product.getPickedOptions() ?? []
  });
  // @TODO - niektóre opcje w stanie mogą być picked: true!!

  // @TODO: memoization!
  let allAvailableOptionsSets: PickedOption[][] = [];

  if (product.getProductType() === ProductType.SIMPLE && product.getPickedOptions()?.length) {
    allAvailableOptionsSets = allAvailableOptionsSets.concat([product.getPickedOptions()!]);
  }

  if (Array.isArray(product.getVariants())) {
    allAvailableOptionsSets = allAvailableOptionsSets.concat(
      product.getVariants()!.map((variant) => variant.getPickedOptions()!)
    );
  }

  const choose = (pickedOption: PickedOption) => {
    const newPickedOptions: PickedOption[] = [
      ...state.pickedOptions.filter((option: PickedOption) => option.name !== pickedOption.name),
      pickedOption
    ];

    newPickedOptions.sort((optionA, optionB) => {
      const optionALevel =
        options?.find((option) => option.name === optionA.name)?.importance || OptionLevel.OPTIONAL;
      const optionBLevel =
        options?.find((option) => option.name === optionB.name)?.importance || OptionLevel.OPTIONAL;
      return optionBLevel - optionALevel;
    });

    product.selectOptions(newPickedOptions);

    const availableOptions = state.availableOptions.map((option) => {
      const pickedOptionsWithoutCurrentlyIteratedOption = newPickedOptions.filter(
        (pickedOption) => pickedOption.name !== option.name
      );

      let x = allAvailableOptionsSets;
      pickedOptionsWithoutCurrentlyIteratedOption.forEach((pickedOptionToFilter) => {
        x = x.filter((optionSet) => {
          const ts = optionSet.find((set) => set.name === pickedOptionToFilter.name);
          return ts?.value === pickedOptionToFilter.value;
        });
      });

      const availableGivenOptionValues = x
        .flat()
        .filter((xo) => xo.name === option.name)
        .map((el) => el.value);

      const newValues: { picked: boolean; available: boolean; value: string }[] = [];

      option.values.forEach((opt, index, array) => {
        const available =
          options?.find((optionsOption) => optionsOption.name === option.name)?.importance ===
            OptionLevel.FORCED || availableGivenOptionValues.includes(opt.value);

        let picked = !!newPickedOptions.find(
          (newOption) => newOption.name === option.name && opt.value === newOption.value
        );

        if (
          newValues[index - 1] &&
          !newValues[index - 1].available &&
          newValues[index - 1].picked
        ) {
          newValues[index - 1].picked = false;
          picked = true;
        }

        if (!available && picked && index === array.length - 1) {
          // @TODO; what if there is no element available?
          newValues.find((el) => el.available)!.picked = true;
          picked = false;
        }

        newValues.push({
          ...opt,
          picked,
          available
        });
      });
      return {
        ...option,
        values: newValues
      };
    });

    setState({
      ...state,
      availableOptions,
      pickedOptions: newPickedOptions
    });
  };

  return {
    choose,
    availableOptions: state.availableOptions
  };
}
