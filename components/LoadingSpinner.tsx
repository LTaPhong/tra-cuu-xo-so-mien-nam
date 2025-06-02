
import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-sky-600"></div>
      <p className="ml-3 text-sky-700 font-medium">Đang tải dữ liệu...</p>
    </div>
  );
};
