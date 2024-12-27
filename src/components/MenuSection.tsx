// components/MenuSection.tsx
import { Separator } from '@radix-ui/react-dropdown-menu';
import type { MenuSection as MenuSectionType } from './types';

interface MenuSectionProps {
  section: MenuSectionType;
  isLast: boolean;
  onItemClick: () => void;
}

export const MenuSection = ({ section, isLast, onItemClick }: MenuSectionProps) => (
  <div className="mb-6 text-darkgrey-krnd">
    <h3 className="px-2 mb-2 text-lg font-semibold text-muted-foreground">
      {section.heading}
    </h3>
    <ul className="space-y-2">
      {section.items.map((item, index) => (
        <li key={index}>
          <a 
            href="#" 
            className="flex items-center px-2 py-2 text-base rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
            onClick={onItemClick}
          >
            {item.icon}
            {item.label}
          </a>
        </li>
      ))}
    </ul>
    {!isLast && <Separator className="my-4" />}
  </div>
);