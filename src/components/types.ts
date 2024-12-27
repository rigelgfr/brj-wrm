// types.ts
export interface MenuItem {
    icon: React.ReactNode;
    label: string;
  }
  
  export interface MenuSection {
    heading: string;
    items: MenuItem[];
  }

  export type FilterOption = {
    value: string;
    label: string;
  };
  
  export type SlicerType = 'year' | 'month' | 'week' | 'warehouse';
  
  export type FilterState = {
    [key in SlicerType]: string[];
  };
  
  