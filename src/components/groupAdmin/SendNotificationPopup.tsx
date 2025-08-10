// SendNotificationPopup.tsx
import React from "react";

interface SendNotificationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (message: string) => void;
}

const SendNotificationPopup: React.FC<SendNotificationPopupProps> = ({
  isOpen,
  onClose,
  onSend,
}) => {
  const [message, setMessage] = React.useState("");

  if (!isOpen) return null;

  const handleSend = () => {
    if (message == "") return
    if (message.trim()) {
      onSend(message);
      setMessage("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-[520px] h-[400px] p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        {/* Title */}
        <h2 className="text-lg font-semibold mb-4">Send Notification</h2>

        {/* Textarea */}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter notification message"
          rows={4}
          className="w-full h-[240px] border border-gray-300 rounded-md p-2 text-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default SendNotificationPopup;
