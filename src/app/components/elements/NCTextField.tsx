import { TextField as MUITextField } from '@mui/material';
import { ChangeEvent } from 'react';

type TextFieldProps = {
  label: string;
  value: string;
  variant?: 'outlined' | 'filled' | 'standard';
  type?: string;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

const TextField = ({
  label,
  value,
  variant = 'outlined',
  type = 'text',
  required = false,
  error = false,
  helperText = '',
  onChange,
}: TextFieldProps) => {
  return (
    <MUITextField
      label={label}
      value={value}
      variant={variant}
      onChange={onChange}
      type={type}
      required={required}
      error={error}
      helperText={helperText}
    />
  );
};

export default TextField;
