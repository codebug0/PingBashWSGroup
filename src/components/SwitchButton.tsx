import React from "react";

type SwitchButtonProps = {
  enabled: boolean;
  onToggle: (value: boolean) => void;
};

const SwitchButton: React.FC<SwitchButtonProps> = ({ enabled, onToggle }) => {
  return (
    <div className="flex items-center justify-center">
      <div className="inline-flex rounded-full bg-gray-800 p-[2px]">
        <button
          onClick={() => onToggle(false)}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-colors duration-300
            ${!enabled ? 'bg-white text-black' : 'text-white hover:bg-gray-700'}`}
        >
          Light
        </button>
        <button
          onClick={() => onToggle(true)}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-colors duration-300
            ${enabled  ? 'bg-white text-black' : 'text-white hover:bg-gray-700'}`}
        >
          Dark
        </button>
      </div>
    </div>
  );
};

export default SwitchButton;
