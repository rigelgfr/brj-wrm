// components/MenuOverlay.tsx
interface MenuOverlayProps {
    isOpen: boolean;
    onClose: () => void;
  }
  
  export const MenuOverlay = ({ isOpen, onClose }: MenuOverlayProps) => {
    if (!isOpen) return null;
    
    return (
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
        onClick={onClose}
      />
    );
  };    