'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const Pagination = ({ currentPage, totalPages }) => {
  const router = useRouter();
  const [inputValue, setInputValue] = useState(currentPage.toString());
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    setInputValue(currentPage.toString());
  }, [currentPage]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Validate input
    const pageNum = parseInt(value, 10);
    const isValidInput = !isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages;
    setIsValid(isValidInput);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      router.push(`?page=${newPage}`);
    }
  };

  const handleInputBlur = () => {
    if (!isValid || inputValue === '') {
      setInputValue(currentPage.toString());
      setIsValid(true);
      return;
    }
    
    const newPage = parseInt(inputValue, 10);
    if (newPage !== currentPage) {
      handlePageChange(newPage);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  return (
    <div className="flex items-center justify-center space-x-2">
      {currentPage > 1 && (
        <button
          onClick={goToPrevPage}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-gray-700 hover:underline"
          aria-label="Previous page"
        >
          &lt;
        </button>
      )}
      
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        className={`h-10 w-16 rounded-lg border ${
          isValid ? 'border-gray-300' : 'border-red-500'
        } bg-white px-3 text-center text-gray-700`}
        aria-label="Current page"
      />
      
      {currentPage < totalPages && (
        <button
          onClick={goToNextPage}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-gray-700 hover:underline"
          aria-label="Next page"
        >
          &gt;
        </button>
      )}
    </div>
  );
};

export default Pagination;