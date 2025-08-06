import React, { useState, useEffect } from "react";
import { MessageUnit } from "@/interface/chatInterface";
import Message from "../chats/message";
import { FONT_SIZE, MSG_COLOR, MSG_DATE_COLOR, REPLY_MGS_COLOR, SERVER_URL } from "@/resource/const/const";
import { chatDate } from "@/resource/utils/helpers";
import { faL } from "@fortawesome/free-solid-svg-icons";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  pinnedMessages: MessageUnit[];
  onClearChat: () => void;
  unPinGroupMessage: (msgId: number) => void;
}

const ManageChatPopup: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  pinnedMessages, 
  onClearChat,
  unPinGroupMessage
}) => {
  const [showPinnedPopover, setShowPinnedPopover] = useState(false);
  const [localPinnedMessages, setLocalPinnedMessages] = useState<MessageUnit[]>([]);

  useEffect(() => {
    if (isOpen) {
      setLocalPinnedMessages(pinnedMessages);
      setShowPinnedPopover(false);
    }
  }, [isOpen, pinnedMessages]);

  const unPinMessage = (msgId: number | null) => {
    if (msgId) {
      unPinGroupMessage(msgId)
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex justify-center items-center">
      <div className="bg-white rounded-xl shadow-xl p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
        >
          ✕
        </button>

        {!showPinnedPopover ? (
          <div className="w-80">
            <h2 className="text-lg font-semibold mb-4">Manage Chat</h2>

            <div className="space-y-3">
              <button
                onClick={() => setShowPinnedPopover(true)}
                className="w-full text-left p-2 bg-gray-100 hover:bg-gray-200 rounded"
              >
                📌 Pinned Messages
              </button>

              <button className="w-full text-left p-2 bg-gray-100 hover:bg-gray-200 rounded"
                onClick={onClearChat}
              >
                🧹 Clear Chat
              </button>
            </div>
          </div>
        ) : (
          <div className="w-[480px]">
            <h2 className="text-lg font-semibold mb-4">Pinned Messages</h2>

            <button
              onClick={() => setShowPinnedPopover(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
            >
              ✕
            </button>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {localPinnedMessages.length === 0 ? (
                <p className="text-sm text-gray-500">No pinned messages.</p>
              ) : (
                localPinnedMessages.map((message, idx) => (
                  <Message
                    key={`message-${idx}`}                          
                    messageId={message.Id}
                    avatar={message?.sender_avatar ? `${SERVER_URL}/uploads/users/${message.sender_avatar}` : null}
                    senderId={message.Sender_Id}
                    sender={message.sender_name}
                    content={`${message.Content}`}
                    sender_banned={message.sender_banned}
                    sender_unban_request={message.sender_unban_request}
                    time={chatDate(`${message.Send_Time}`)}
                    ownMessage={false}
                    isCreater={false}
                    read_time={message.Read_Time}
                    parentMsg={null}
                    showPin={true}
                    isPinned={true}
                    isTabbed={false}
                    show_reply={false}

                    show_avatar={true}
                    font_size={FONT_SIZE}
                    message_color={MSG_COLOR}
                    date_color={MSG_DATE_COLOR}
                    reply_message_color={REPLY_MGS_COLOR}

                    onDelete={() => {}}
                    onBanUser={() => {}}
                    onReplyMessage={() => {}}
                    onReplyMsgPartClicked={() => {}}
                    onEndedHighlight={() => {}}                           
                    onPinMessage={unPinMessage}                            
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageChatPopup;
