'use client'

// components/Header.tsx (your modified header)
import { useState } from 'react';
import { User, Menu, Home, Info, Mail, Settings, LogOut } from 'lucide-react';
import { Button } from './ui/Button';
import { Session } from 'next-auth';
import { MenuOverlay } from './MenuOverlay';
import { SlidingMenu } from './SlidingMenu';
import type { MenuSection } from './types';

interface HeaderProps {
  appName?: string;
  session: Session | null;
}

const menuItems: MenuSection[] = [
  {
    heading: "Navigation",
    items: [
      { icon: <Home className="mr-2 h-4 w-4" />, label: 'Dashboard' },
      { icon: <Info className="mr-2 h-4 w-4" />, label: 'About' },
      { icon: <Mail className="mr-2 h-4 w-4" />, label: 'Contact' },
    ]
  },
  {
    heading: "Account",
    items: [
      { icon: <Settings className="mr-2 h-4 w-4" />, label: 'Settings' },
    ]
  },
  {
    heading: "Session",
    items: [
      { icon: <LogOut className="mr-2 h-4 w-4" />, label: 'Logout' },
    ]
  }
];

export default function Header({ 
  appName = "MyApp",
  session
}: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);

  if (!session) return null;

  return (
    <>
      <header className="bg-[url('/images/main-bg.png')] bg-cover bg-center drop-shadow-sm">
        <div className="mx-[2em] h-12 flex items-center justify-between text-darkgrey-krnd">
          <div className="text-2xl font-bold text-primary">
            {appName}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium">{session.user?.name}</p>
              <p className="text-xs text-muted-foreground">{session.user?.roleName}</p>
            </div>
            
            <Button 
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              className="rounded-full"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          </div>
        </div>
      </header>

      <MenuOverlay isOpen={isOpen} onClose={toggleMenu} />
      
      <SlidingMenu
        isOpen={isOpen}
        onClose={toggleMenu}
        menuItems={menuItems}
        session={session}
      />
    </>
  );
}