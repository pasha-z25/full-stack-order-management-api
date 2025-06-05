import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { Control, Controller } from 'react-hook-form';

interface Option {
  value: string | number;
  label: string;
}

interface ControlledSelectProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  name: string;
  label: string;
  options: Option[];
  fullWidth?: boolean;
  className?: string;
}

export default function ControlledSelect({
  control,
  name,
  label,
  options,
  fullWidth = true,
  className = '',
  ...props
}: ControlledSelectProps) {
  return (
    <FormControl fullWidth={fullWidth} className={className}>
      <InputLabel id={`${name}-label`}>{label}</InputLabel>
      <Controller
        name={name}
        control={control}
        defaultValue={options[0]?.value || ''}
        render={({ field, fieldState: { error } }) => (
          <Select
            {...field}
            label={label}
            labelId={`${name}-label`}
            id={name}
            error={!!error}
            value={field.value ?? ''}
            {...props}
          >
            {options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        )}
      />
    </FormControl>
  );
}
