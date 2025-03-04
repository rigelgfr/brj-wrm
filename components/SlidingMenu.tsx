'use client'

import { LayoutDashboard, Factory, SquareStack, Database, LogOut, ArrowDownToLine, ArrowUpFromLine, Truck, Save, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Session } from 'next-auth';
import { signOut } from 'next-auth/react';

interface MenuItem {
  icon: JSX.Element;
  label: string;
  href: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
  roleRequired?: string; // Added roleRequired property
}

interface SlidingMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: Session | null;
}

const menuSections: MenuSection[] = [
  {
    title: 'Navigation',
    items: [
      { icon: <LayoutDashboard className="w-4 h-4" />, label: 'Dashboard', href: '/dashboard' },
      { icon: <Factory className="w-4 h-4" />, label: 'Operations', href: '/operations' },
      { icon: <SquareStack className="w-4 h-4" />, label: 'Occupancy (SQM)', href: '/occupancy/sqm' },
      { icon: <SquareStack className="w-4 h-4" />, label: 'Occupancy (VOL)', href: '/occupancy/vol' },
      { icon: <SquareStack className="w-4 h-4" />, label: 'Occupancy (v2)', href: '/occupancy/v2' },
      { icon: <Truck className='w-4 h-4' />, label: 'Trucks', href:'/truck'},
      { icon: <Users className='w-4 h-4' />, label: 'Client Trends', href: '/customer' },
    ]
  },
  {
    title: 'Data',
    items: [
      { icon: <ArrowDownToLine className="w-4 h-4" />, label: 'Inbound', href: '/inbound' },
      { icon: <ArrowUpFromLine className="w-4 h-4" />, label: 'Outbound', href: '/outbound' },
      { icon: <Database className="w-4 h-4" />, label: 'Inventory', href: '/inventory' },
      { icon: <Database className="w-4 h-4" />, label: 'Inventory (v2)', href: '/inventory/v2' },
      { icon: <Save className='w-4 h-4' />, label: 'Backup/Restore DB', href: '/backup' },
    ]
  },
  {
    title: 'Admin',
    items: [
      { icon: <Users className="w-4 h-4" />, label: 'Users', href: '/admin' },
    ],
    roleRequired: 'SUPER_ADMIN' // This section requires SUPER_ADMIN role
  }
];

export default function SlidingMenu({ open, onOpenChange, session }: SlidingMenuProps) {
  if (!session) return null;
  
  // Get user role from session
  const userRole = session.user?.role || '';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger></SheetTrigger>
      <SheetContent
        side="right"
        className="w-[300px] flex flex-col h-full p-0"
      >
        {/* Header Section - Fixed */}
        <div className="p-6 border-b">
          <SheetHeader className="mb-0">
            <SheetTitle className="text-darkgrey-krnd">{session.user?.name}</SheetTitle>
            <p className="text-sm text-muted-foreground">{session.user?.email}</p>
          </SheetHeader>
        </div>

        {/* Scrollable Content Section */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-4">
            {menuSections.map((section, index) => {
              // Skip rendering sections that require a specific role if user doesn't have it
              if (section.roleRequired && section.roleRequired !== userRole) {
                return null;
              }
              
              return (
                <div key={index} className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground tracking-wider">
                    {section.title}
                  </h3>
                  <nav className="space-y-1">
                    {section.items.map((item, itemIndex) => (
                      <a
                        key={itemIndex}
                        href={item.href}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                        onClick={() => onOpenChange(false)}
                      >
                        {item.icon}
                        {item.label}
                      </a>
                    ))}
                  </nav>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Section - Fixed */}
        <div className="p-6 border-t mt-auto">
          <Button
            variant="ghost"
            className="w-full flex items-center gap-2 bg-red-500 hover:bg-red-600 hover:text-white text-white"
            onClick={() => signOut()}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}