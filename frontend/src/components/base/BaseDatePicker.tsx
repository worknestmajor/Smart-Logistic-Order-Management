import { BaseInput } from './BaseInput';
import type { BaseInputProps } from './BaseInput';

export function BaseDatePicker(props: BaseInputProps) {
  return <BaseInput type='date' {...props} />;
}
