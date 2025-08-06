import React, { useEffect, useState } from 'react';

interface ChatLimitPopupProps {
  isOpen: boolean;
  postLvl: number | null | undefined;
  urlLvl: number | null | undefined;
  slow_mode: boolean | null | undefined;
  slowTime: number | null | undefined;
  onClose: () => void;
  onConfirm: (settings: any) => void;
}

const ChatLimitPopup: React.FC<ChatLimitPopupProps> = ({ 
  isOpen,
  postLvl,
  urlLvl,
  slow_mode,
  slowTime, 
  onClose, 
  onConfirm 
}) => {
  // State variables
  const [postOption, setPostOption] = useState<number | null> (null);
  const [urlOption, setUrlOption] = useState<number | null>(null);
  const [slowMode, setSlowMode] = useState(false);
  const [speedOption, setSpeedOption] = useState<'5' | '10' | '15' | 'Custom'>('5');
  const [customSeconds, setCustomSeconds] = useState<string>('');
   

  const handleOk = () => {
    const settings = {
      postOption,
      urlOption,
      slowMode,
      speed: speedOption === 'Custom' ? parseInt(customSeconds) : parseInt(speedOption),
    };
    onConfirm(settings);
  };

  useEffect(() => {
    setPostOption(postLvl ?? 0)
  }, [postLvl]);

  useEffect(() => {
    setUrlOption(urlLvl ?? 0)
  }, [urlLvl]);

  useEffect(() => {
    setSlowMode(slow_mode ?? false)
  }, [slow_mode]);

  useEffect(() => {
    if (slowTime == 5) {
      setSpeedOption('5')
    } else if (slowTime == 10) {
      setSpeedOption('10')
    } else if (slowTime == 15) {
      setSpeedOption('15')
    } else {
      setSpeedOption('Custom')
      if (slowTime == null || slowTime == 0) {
        setCustomSeconds('')
      } else {
        setCustomSeconds(slowTime.toString())
      }
    }
  }, [slowTime])

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[400px] p-8 relative shadow-lg ">

        {/* Close Button */}
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          ✕
        </button>

        {/* Content */}
        <div className="space-y-4 max-h-[80%] overflow-auto">

          {/* Section 1: Who Can Post */}
          <div>
            <h2 className="font-semibold mb-2">Who Can Post</h2>
            <div className="flex flex-col space-y-2">
              <label className="flex items-center text-[18px]">
                <input
                  type="radio"
                  className="mr-2 w-4 h-4"
                  checked={postOption === 0}
                  onChange={() => setPostOption(0)}
                />
                Anyone
              </label>
              <label className="flex items-center text-[18px]">
                <input
                  type="radio"
                  className="mr-2 w-4 h-4"
                  checked={postOption === 1}
                  onChange={() => setPostOption(1)}
                />
                Verified Users
              </label>
              <label className="flex items-center text-[18px]">
                <input
                  type="radio"
                  className="mr-2 w-4 h-4"
                  checked={postOption === 2}
                  onChange={() => setPostOption(2)}
                />
                Admin & Mods
              </label>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-300 my-4"></div>

          {/* Section 2: Who Can Post URLs */}
          <div>
            <h2 className="font-semibold mb-2">Who can post URLs</h2>
            <div className="flex flex-col space-y-2">
              <label className="flex items-center text-[18px]">
                <input
                  type="radio"
                  className="mr-2 w-4 h-4"
                  checked={urlOption === 0}
                  onChange={() => setUrlOption(0)}
                />
                Everyone
              </label>
              <label className="flex items-center text-[18px]">
                <input
                  type="radio"
                  className="mr-2 w-4 h-4"
                  checked={urlOption === 1}
                  onChange={() => setUrlOption(1)}
                />
                Admin & Mods
              </label>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-300 my-4"></div>

          {/* Section 3: Slow Mode */}
          <div>
            <label className="flex items-center space-x-2 text-[18px]">
              <input
                type="checkbox"
                checked={slowMode}
                onChange={(e) => setSlowMode(e.target.checked)}
              />
              <span>Turn on Slow Mode</span>
            </label>

            {/* If Slow Mode is enabled, show options */}
            {slowMode && (
              <div className="mt-2 pl-4">
                {/* Speed Options */}
                <div className="mb-2">
                  <div className="flex flex-col space-y-2 text-[18px]">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        className="mr-2 w-4 h-4"
                        checked={speedOption === '5'}
                        onChange={() => setSpeedOption('5')}
                      />
                      Every 5 seconds
                    </label>
                    <label className="flex items-center text-[18px]">
                      <input
                        type="radio"
                        className="mr-2 w-4 h-4"
                        checked={speedOption === '10'}
                        onChange={() => setSpeedOption('10')}
                      />
                      Every 10 Seconds
                    </label>
                    <label className="flex items-center text-[18px]">
                      <input
                        type="radio"
                        className="mr-2 w-4 h-4"
                        checked={speedOption === '15'}
                        onChange={() => setSpeedOption('15')}
                      />
                      Every 15 Seconds
                    </label>
                    <label className="flex items-center text-[18px]">
                      <input
                        type="radio"
                        className="mr-2 w-4 h-4"
                        checked={speedOption === 'Custom'}
                        onChange={() => setSpeedOption('Custom')}
                      />
                      Custom
                    </label>
                  </div>
                </div>

                {/* Custom Seconds Input - only visible if Custom is selected */}
                {speedOption === 'Custom' && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min={1}
                      placeholder="Seconds"
                      value={customSeconds}
                      onChange={(e) => setCustomSeconds(e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1"
                    />
                    <span>seconds</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="mt-6 flex justify-end space-x-2">
          <button
            className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            onClick={handleOk}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatLimitPopup;