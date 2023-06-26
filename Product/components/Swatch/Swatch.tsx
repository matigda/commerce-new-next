import cn from 'classnames';
import { FC } from 'react';
import s from './Swatch.module.css';
import { Check } from '@Core/icons';
import Button, { ButtonProps } from '@Core/components/Button';
import { isDark } from '@Core/lib/colors';
interface Props {
  active?: boolean;
  children?: any;
  className?: string;
  label?: string;
  optionName: string;
  color?: string;
}

const Swatch: FC<Props & ButtonProps> = ({
  className,
  color = '',
  label,
  optionName = 'size',
  active,
  ...props
}) => {
  optionName = optionName?.toLowerCase();
  label = label?.toLowerCase();

  const rootClassName = cn(
    s.root,
    {
      [s.active]: active,
      [s.size]: optionName === 'size',
      [s.color]: color,
      [s.dark]: color ? isDark(color) : false
    },
    className
  );

  return (
    <Button
      className={rootClassName}
      style={color ? { backgroundColor: color } : {}}
      aria-label="Variant Swatch"
      {...props}
    >
      {optionName === 'color' && active && (
        <span>
          <Check />
        </span>
      )}
      {optionName !== 'color' ? label : null}
    </Button>
  );
};

export default Swatch;
