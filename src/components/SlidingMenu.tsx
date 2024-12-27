// components/SlidingMenu.tsx
import { useEffect, useState } from 'react';
import type { MenuSection as MenuSectionType } from './types';
import { MenuSection } from './MenuSection';
import { User, X } from 'lucide-react';
import { Button } from './ui/Button';  // Use your custom Button
import { Session } from 'next-auth';

interface SlidingMenuProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuSectionType[];
  session: Session;
}

export const SlidingMenu = ({ isOpen, onClose, menuItems, session }: SlidingMenuProps) => {
  const [menuWidth, setMenuWidth] = useState('33.333vw');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setMenuWidth('100vw');
      } else if (width < 1024) {
        setMenuWidth('50vw');
      } else {
        setMenuWidth('33.333vw');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div 
      style={{ width: menuWidth }}
      className={`fixed top-0 right-0 h-full bg-white shadow-lg transform transition-all duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Menu Header */}
        <div className="bg-darkgrey-krnd text-primary-foreground p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Menu</h2>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onClose}
              className="text-primary-foreground hover:bg-primary/90"
            >
              <X className="h-6 w-6" />
              <span className="sr-only">Close menu</span>
            </Button>
          </div>
          
          <div className="flex items-center">
          <User className="h-10 w-10 mr-4" />
            <div>
              <p className="font-medium text-lg">{session.user?.name}</p>
              <p className="text-sm opacity-75">{session.user?.roleName}</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-grow overflow-y-auto p-4">
          {menuItems.map((section, index) => (
            <MenuSection
              key={index}
              section={section}
              isLast={index === menuItems.length - 1}
              onItemClick={onClose}
            />
          ))}
        </nav>
      </div>
    </div>
  );
};