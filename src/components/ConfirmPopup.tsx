// components/Popup.tsx
import React from 'react';

interface ConfirmPopupProps {
  title: string;
  description: string;
  yesBtnTitle: string;
  noBtnTitle: string;
  isOpen: boolean;
  onNoBtnclicked: () => void;
  onYesBtnClicked: () => void;
}

const ConfirmPopup: React.FC<ConfirmPopupProps> = ({ 
  isOpen, title, description, yesBtnTitle,  noBtnTitle, onNoBtnclicked, onYesBtnClicked}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        {/* Close button (X) in top-right corner */}
        <button
          onClick={onNoBtnclicked}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 focus:outline-none"
          aria-label="Close"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 className="text-lg font-medium text-gray-900 pr-6">{title}</h3>
        <p className="mt-2 text-sm text-gray-500">{description}</p>
        
        <div className="mt-4 flex justify-end space-x-3">
          <button
            onClick={onNoBtnclicked}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {noBtnTitle}
          </button>
          <button
            onClick={onYesBtnClicked}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md border border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            {yesBtnTitle}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmPopup;
