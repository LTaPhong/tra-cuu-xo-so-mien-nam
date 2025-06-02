
import React from 'react';
import { AlertTriangleIcon, XIcon } from './icons/FeedbackIcons';

interface ErrorMessageProps {
  message: string;
  onClose?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onClose }) => {
  return (
    <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg shadow-md animate-fadeIn" role="alert">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertTriangleIcon />
        </div>
        <div className="ml-3 flex-grow">
          <p className="text-sm font-medium text-red-700">{message}</p>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                aria-label="Đóng"
              >
                <XIcon />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
