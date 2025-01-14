  export type FilterOption = {
    value: string;
    label: string;
  };
  
  export type SlicerType = 'year' | 'month' | 'week' | 'warehouse';
  
  export type FilterState = {
    [key in SlicerType]: string[];
  };
  
  