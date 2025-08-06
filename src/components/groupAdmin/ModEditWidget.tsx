import React, { useState } from 'react';

interface ModEditWidgetProps {
  initialSettings?: {
    chatLimit?: boolean;
    manageChat?: boolean;
    manageMods?: boolean;
    censoredContent?: boolean;
    banUsers?: boolean;
  };
  onSave: (settings: {
    chatLimit: boolean;
    manageChat: boolean;
    manageMods: boolean;
    censoredContent: boolean;
    banUsers: boolean;
  }) => void;
}

const ModEditWidget: React.FC<ModEditWidgetProps> = ({ initialSettings, onSave }) => {
  const [chatLimit, setChatLimit] = useState(initialSettings?.chatLimit ?? false);
  const [manageChat, setManageChat] = useState(initialSettings?.manageChat ?? false);
  const [manageMods, setManageMods] = useState(initialSettings?.manageMods ?? false);
  const [censoredContent, setCensoredContent] = useState(initialSettings?.censoredContent ?? false);
  const [banUsers, setBanUsers] = useState(initialSettings?.banUsers ?? false);

  const handleSave = () => {
    onSave({
      chatLimit,
      manageChat,
      manageMods,
      censoredContent,
      banUsers,
    });
  };

  return (
    <div className="w-full max-w-md bg-white border border-gray-300 rounded-lg shadow-md p-6">
      <div className="space-y-4">
        <label className="flex items-center space-x-2 text-[18px]">
          <input type="checkbox" checked={chatLimit} className='w-[18px] h-[18px]' onChange={(e) => setChatLimit(e.target.checked)} />
          <span>Set chat limitation</span>
        </label>

        <label className="flex items-center space-x-2 text-[18px]">
          <input type="checkbox" checked={manageChat} className='w-[18px] h-[18px]' onChange={(e) => setManageChat(e.target.checked)} />
          <span>Manage chat</span>
        </label>

        <label className="flex items-center space-x-2 text-[18px]">
          <input type="checkbox" checked={manageMods} className='w-[18px] h-[18px]' onChange={(e) => setManageMods(e.target.checked)} />
          <span>Manage moderators</span>
        </label>

        <label className="flex items-center space-x-2 text-[18px]">
          <input type="checkbox" checked={censoredContent} className='w-[18px] h-[18px]' onChange={(e) => setCensoredContent(e.target.checked)} />
          <span>Set / Edit censored content</span>
        </label>

        <label className="flex items-center space-x-2 text-[18px]">
          <input type="checkbox" checked={banUsers} className='w-[18px] h-[18px]' onChange={(e) => setBanUsers(e.target.checked)} />
          <span>Ban / Unban users</span>
        </label>
      </div>

      <div className="mt-6 text-right">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={handleSave}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default ModEditWidget;
