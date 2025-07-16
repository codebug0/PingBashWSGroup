import React from 'react';

interface SwitchProps {
  state: boolean;
  action: (newValue: boolean) => void;
}

const Switch: React.FC<SwitchProps> = ({ state, action }) => {
  const handleClick = () => {
    action(!state);
  };

  return (
    <div
      onClick={handleClick}
      className={`w-[2.2em] cursor-pointer p-[2px] inline-block rounded-full ${state ? 'bg-gradient-to-r from-[#0F00D4] to-[#B300C8]' : 'bg-gray-600'}`}
    >
      <span
        className={`inline-block w-[1em] rounded-full h-[1em] bg-white ${state ? 'float-right' : 'float-left'}`}
      ></span>
    </div>
  );
};

export default Switch;