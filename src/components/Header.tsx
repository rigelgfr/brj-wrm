'use client'

// components/Header.tsx (your modified header)
import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from './ui/Button';
import { Session } from 'next-auth';
import SlidingMenu from './SlidingMenu';

interface HeaderProps {
  appName?: string;
  session: Session | null;
}

export default function Header({ 
  appName = "MyApp",
  session
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  if (!session) return null;

  return (
    <>
      <header className="bg-[url('/images/main-bg.png')] bg-cover bg-center drop-shadow-sm">
        <div className="mx-[2em] h-12 flex items-center justify-between">
          <div className="text-2xl font-bold text-primary text-white">
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
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          </div>
        </div>
      </header>


      <SlidingMenu 
        open={menuOpen} 
        onOpenChange={setMenuOpen}
        session={session} 
      />
    </>
  );
}