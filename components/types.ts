// First, let's create a separate types file (types.ts)
export type FilterType = 'text' | 'select';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  id: string;
  placeholder: string;
  width?: string;
  type?: FilterType;
  options?: FilterOption[];
  isPrimary?: boolean;
}