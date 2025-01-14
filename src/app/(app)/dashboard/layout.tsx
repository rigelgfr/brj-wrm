import React from 'react';
import Clock from '@/src/components/Clock';

const DashboardLayout = () => {
  return (
    <div className="p-4 mx-[1em]">
      <div className="grid grid-cols-4 gap-6">
        {/* First cell: Title */}
        <div className="flex flex-row items-start col-span-2">
            <div className='flex items-center w-full'>
                <div className='w-1/2'>
                    <h1 className="text-5xl font-bold text-green-krnd">Dashboard</h1>
                </div>
                <div className='w-1/2'>
                    <Clock />
                </div>
            </div>
          
        </div>

        {/* Second cell: Clock */}
        <div className="flex items-start justify-end">
          Grid Item 2
        </div>

        {/* Third and Fourth cells of first row */}
        <div className="bg-gray-100 rounded-lg p-4">Grid Item 3</div>
        {[5, 6, 7, 8].map((item) => (
            <div 
                key={item} 
                className="h-48 bg-gray-100 rounded-lg p-4"
            >
                Grid Item {item}
            </div>
            ))}
      </div>
    </div>
  );
};

export default DashboardLayout;