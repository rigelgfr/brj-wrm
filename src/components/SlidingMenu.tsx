import { LayoutDashboard, Factory, SquareStack, Database, LogOut, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
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
    ]
  },
  {
    title: 'Data',
    items: [
      { icon: <ArrowDownToLine className="w-4 h-4" />, label: 'Inbound', href: '/inbound' },
      { icon: <ArrowUpFromLine className="w-4 h-4" />, label: 'Outbound', href: '/outbound' },
      { icon: <Database className="w-4 h-4" />, label: 'Inventory', href: '/inventory' },
    ]
  }
];

export default function SlidingMenu({ open, onOpenChange, session }: SlidingMenuProps) {
  if (!session) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger></SheetTrigger>
      <SheetContent
        side="right"
        className='w-[300px] fixed inset-y-0 right-0 data-[state=closed]:slide-in-from-left data-[state=open]:slide-in-from-right'
      >
        <SheetHeader className="mb-6">
          <SheetTitle>{session.user?.name}</SheetTitle>
          <p className="text-sm text-muted-foreground">{session.user?.email}</p>
        </SheetHeader>

        {/* Navigation Sections */}
        <div className="space-y-6">
          {menuSections.map((section, index) => (
            <div key={index} className="space-y-3">
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
          ))}
        </div>

        {/* Sign Out Button */}
        <Button
          variant="ghost"
          className="w-full mt-6 flex items-center gap-2 bg-red-500 hover:bg-red-600 hover:text-white text-white"
          onClick={() => signOut()}
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </SheetContent>
    </Sheet>
  );
}