import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';

export function cn(...args: ClassValue[]) {
  return clsx(args);
}
