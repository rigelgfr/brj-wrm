import React from 'react';
import { LucideIcon } from 'lucide-react';

interface HeadingProps {
  text: string;
  Icon: LucideIcon;
}

const Heading: React.FC<HeadingProps> = ({ text, Icon }) => {
  return (
    <div className="flex flex-row items-center text-green-krnd">
      <Icon className="h-5 w-5 mr-1" />
      <p className="text-xl font-bold">{text}</p>
    </div>
  );
};

export default Heading;