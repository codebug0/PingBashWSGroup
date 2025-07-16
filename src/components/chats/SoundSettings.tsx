import React, { useState } from 'react';

const SoundSettings = () => {
  const [selectedOption, setSelectedOption] = useState<string>('never');
  const [isVisible, setIsVisible] = useState<boolean>(true);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOption(event.target.value);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="relative border p-4 w-72 rounded shadow bg-white">
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 text-gray-500 hover:text-black"
        aria-label="Close"
      >
        ×
      </button>

      <h3 className="text-lg font-medium mb-2">Play sounds:</h3>
      <form>
        <div className="flex items-center mb-2">
          <input
            type="radio"
            id="every"
            name="sound"
            value="every"
            checked={selectedOption === 'every'}
            onChange={handleChange}
            className="mr-2"
          />
          <label htmlFor="every">On every message</label>
        </div>
        <div className="flex items-center mb-2">
          <input
            type="radio"
            id="mentions"
            name="sound"
            value="mentions"
            checked={selectedOption === 'mentions'}
            onChange={handleChange}
            className="mr-2"
          />
          <label htmlFor="mentions">Only on @ replies</label>
        </div>
        <div className="flex items-center mb-4">
          <input
            type="radio"
            id="never"
            name="sound"
            value="never"
            checked={selectedOption === 'never'}
            onChange={handleChange}
            className="mr-2"
          />
          <label htmlFor="never">Never</label>
        </div>
        <button
          type="button"
          onClick={() => alert(`Selected: ${selectedOption}`)}
          className="bg-gray-300 hover:bg-gray-400 text-black py-1 px-4 rounded"
        >
          OK
        </button>
      </form>
    </div>
  );
};

export default SoundSettings;
