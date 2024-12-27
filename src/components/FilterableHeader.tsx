'use client';

import React, { useState } from 'react';
import { Button } from '@/src/components/ui/Button'; // Adjust this import based on your Button component location
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/Popover'; // Adjust this import based on your Popover component location
import { Command, CommandInput, CommandList } from '@/src/components/ui/Command'; // Adjust this import based on your Command component location

interface FilterableHeaderProps {
  column: string;
  onFilter: (filter: string) => void;
}

const FilterableHeader: React.FC<FilterableHeaderProps> = ({ column, onFilter }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterValue, setFilterValue] = useState('');

  const handleApplyFilter = () => {
    onFilter(filterValue);
    setIsOpen(false);
  };

  const formatHeader = (header: string) => {
    return header
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="flex items-center space-x-2">
      <span>{formatHeader(column)}</span>
      <Popover isOpen={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm">
            Filter
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="p-4">
            <Command>
              <Command.Input
                placeholder={`Filter ${formatHeader(column)}`}
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
              />
              <Command.List>
                {/* Add filter suggestions here if needed */}
              </Command.List>
              <div className="flex justify-end space-x-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={handleApplyFilter}>
                  Apply
                </Button>
              </div>
            </Command>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default FilterableHeader;
