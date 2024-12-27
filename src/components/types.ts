// types.ts
export interface MenuItem {
    icon: React.ReactNode;
    label: string;
  }
  
  export interface MenuSection {
    heading: string;
    items: MenuItem[];
  }