'use client'
import Image from 'next/image';
import React, { Suspense, useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faClose, 
  faBan, 
  faThumbTack, 
  faThumbtackSlash
} from "@fortawesome/free-solid-svg-icons";
import Lottie from "lottie-react"
import { stickers } from './LottiesStickers';
import { ChatGroup, MessageUnit } from '@/interface/chatInterface';

interface MessageProps {
  avatar: string | null, 
  content: string, 
  sender_banned: number | null,
  sender_unban_request: number | null,
  time: string, 
  ownMessage?: boolean, 
  isCreater: boolean,
  read_time: string | null,

  message_color: string,
  date_color: string,
  show_avatar: boolean,
  font_size: number,  
  
  reply_message_color: string;
  parentMsg: MessageUnit | undefined | null,

  showPin: boolean,
  isPinned: boolean,
  isTabbed: boolean,
  show_reply: boolean,

  message: MessageUnit | null,
  group: ChatGroup | null,
  userId: number | null,
  onDelete: (msgId: number | null | undefined) => void;
  onBanUser: (userid: number | null) => void;
  onPinMessage: (msgId: number | null) => void;
  onReplyMessage: (msgId: number | null | undefined) => void;
  onReplyMsgPartClicked: (msgId: number | null | undefined) => void;
  onEndedHighlight: () => void;
}

const Message: React.FC<MessageProps> = ({ 
  avatar, 
  content, 
  sender_banned,
  sender_unban_request,
  time, 
  ownMessage, 
  isCreater,
  read_time,
  parentMsg,
  message_color,
  date_color,
  show_avatar,
  font_size,
  reply_message_color,
  showPin,
  isPinned,
  isTabbed,
  show_reply,
  message,
  group, 
  userId,
  onDelete,
  onBanUser,
  onPinMessage,
  onReplyMessage,
  onReplyMsgPartClicked,
  onEndedHighlight
}) => {
  const messageRef = useRef<HTMLDivElement | null>(null);
  const [highlight, setHighlight] = useState(false);
  const [filterModeText, setFilterModeText] = useState<string | null>(null)

  const onBanButtonClicked = () => onBanUser(message?.Sender_Id ?? null);
  const onDeleteButtonClicked = () => onDelete(message?.Id);
  const onPinButtonClicked = () => onPinMessage(message?.Id ?? null);
  const onReplyButtonClicked = () => onReplyMessage(message?.Id);

  const getSticker = (content: string) => {
    const stickerName = content.slice("sticker::".length);
    const sticker = stickers.find((stk) => stk.name === stickerName);
    return sticker?.content;
  }

  const disabledContent = (content: string | null): string => {
    return content
      ? content.replace(/<a /g, '<a class="pointer-events-none cursor-default" ')
      : '';
  };

  const getReplyMsgContentHtml = (content: string | null) => {
    let type = "text";
    let value = content;
    if (content!.includes("<img")) { type = "img"; value = "Photo"; }
    else if (content!.includes("gif::https://") || (content!.includes(".gif") && !content!.includes(" ") && content!.includes("https://"))) {
      type = "gif"; value = "Gif";
    } else if (content!.includes("sticker::")) {
      type = "sticker"; value = "Sticker";
    } 

    if (type == "text") {
      return <span className='mt-[3px]' style={{ fontSize: font_size - 2 }} dangerouslySetInnerHTML={{ __html: disabledContent(content) }}/>;
    } else {
      return <div className='mt-[3px]' style={{ fontSize: font_size - 2 }}>{value}</div>;
    }
  }

  const getReplyMsgImgHtml = (content: string | null) => {
    if (content!.includes("<img")) {
      let contentStr = content!.replace("<img", "<img style='height: 30px'");
      return <span className="inline-block w-fit ml-[6px] h-[30px]" dangerouslySetInnerHTML={{ __html: contentStr! }} />;
    }
    if (content!.includes("gif::https://")) {
      return <img src={content!.slice("gif::".length)} className="h-[30px] ml-[6px]" />;
    }
    if (content!.includes(".gif") && content!.includes("https://") && !content!.includes(" ")) {
      return <img src={content!} className="h-[30px] ml-[6px]" />;
    }
    if (content!.includes("sticker::")) {
      return <Lottie animationData={getSticker(content!)} style={{ height: 30, marginLeft: 6 }} />;
    }
    return null;
  }

  useEffect(() => {
    if (isTabbed) {
      setHighlight(true);
      const timeout = setTimeout(() => setHighlight(false), 1600); // remove after 1s
      return () => clearTimeout(timeout);
    }
  }, [isTabbed]);

  useEffect(() => {
    if (!highlight) {
      // onEndedHighlight();
    }
  }, [highlight]);

  useEffect(() => {
    if (message && group && userId) {
      if (message.Receiver_Id && message.Receiver_Id == 1) {
        setFilterModeText("Mods")
      } else if (message.Receiver_Id && message.Receiver_Id > 1) {
        if (message.Receiver_Id == userId) {
          setFilterModeText("1 on 1")
        } else {
          const receiverName = group.members?.find(mem => mem.id == message.Receiver_Id)?.name
          setFilterModeText("1 on 1: " + receiverName)
        }        
      }
    }
  }, [message, group, userId])

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div 
        ref={messageRef} 
        className={`border-b-2 border-gray-200 px-[14px] py-[4px] chat-box transition-colors duration-[1200ms] ${highlight ? 'bg-blue-200' : 'bg-transparent'}`}
      >
        <div className="flex justify-between items-start relative">
          <div className="flex items-start gap-2">
            {show_avatar && <Image
              className="my-2 w-[40px] h-[40px] rounded-full object-cover"
              src={avatar || "/assets/default-user.svg"}
              alt="user"
              width={40}
              height={40}
            />}

            <div className="flex items-start gap-1 flex-nowrap">
              <div className={`relative ${content.includes("<img") ? "flex" : ""} text-[15px] mt-[16px]`} style={{ color: message_color, fontSize:font_size }}>
                <span className="font-bold mr-[8px]" style={{ fontSize: font_size }}>{message?.sender_name}:</span>
                {parentMsg && 
                  <div className="flex-row-center rounded-[8px] overflow-y-hidden cursor-pointer"
                    style={{ height: font_size * 3, background: reply_message_color + "22" }}
                    onClick={() => onReplyMsgPartClicked(parentMsg.Id)}>
                    <div className="h-[45px] w-[4px]" style={{ background: reply_message_color }}></div>
                    <div style={{ fontSize: font_size - 1 }}>{getReplyMsgImgHtml(parentMsg.Content)}</div>                  
                    <div className='ml-[8px] p-[4px] mr-[6px]'>
                      <div className='font-bold' style={{ color: reply_message_color }}>{parentMsg.sender_name}</div>
                      <div style={{ color: message_color }}>{getReplyMsgContentHtml(parentMsg.Content)}</div>
                    </div>
                  </div>
                }
                {content.includes("<img") ? 
                  <span className="inline-block w-fit" dangerouslySetInnerHTML={{ __html: content }} /> :
                  content.includes("gif::https://") ?
                    <img src={content.slice("gif::".length)} className="w-40" /> :
                    content.includes("sticker::") ?
                      <Lottie animationData={getSticker(content)} style={{ width: 120, height: 120 }} /> :
                      content.includes(".gif") ? <img src={content} className="w-40" /> : <span dangerouslySetInnerHTML={{ __html: content! }} />}
              </div>
            </div>
          </div>
          {filterModeText && <div className={`absolute right-[0px] bottom-[-4px] px-[8px] py-[3px] ${filterModeText == "Mods" ? "bg-black" : "bg-gray-600"} text-white text-[12px]`}>{filterModeText}</div>}
          <div className="h-[16px] flex items-center whitespace-nowrap absolute top-[4px] right-0 gap-4 mr-[12px]">
            {show_reply && <p className="text-[12px] cursor-pointer" style={{ color: date_color, fontSize: font_size * 0.9 }} onClick={onReplyButtonClicked}>Reply</p>}
            <p className="text-[12px]" style={{ color: date_color, fontSize: font_size * 0.9 }}>{time}</p>
            {isPinned && <button onClick={onPinButtonClicked}>
              <FontAwesomeIcon icon={faThumbtackSlash} className='rotate-45 transition-transform' style={{ color: date_color, fontSize: font_size }} />
            </button>}
            {showPin && !isPinned && <button onClick={onPinButtonClicked}>
              <FontAwesomeIcon icon={faThumbTack} className='rotate-45 transition-transform' style={{ color: date_color, fontSize: font_size }} />
            </button>}
            {isCreater && !ownMessage && sender_banned !== 1 &&
              <button onClick={onBanButtonClicked} disabled={sender_banned === 1} className={`${sender_banned === 1 ? "cursor-not-allowed" : "cursor-pointer"}`}>
                <FontAwesomeIcon icon={faBan} className={`text-[16px] ${sender_banned === 1 ? "text-[#CFCFCF]" : "text-[#8A8A8A]"}`} style={{ color: date_color, fontSize: font_size }} />
              </button>}
            {isCreater &&
              <button onClick={onDeleteButtonClicked}>
                <FontAwesomeIcon icon={faClose} style={{ color: date_color, fontSize: font_size }} />
              </button>}
          </div>
        </div>
      </div>
    </Suspense>
  );
};

export default Message;
