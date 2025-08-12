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
import { chatDate, isTimedout } from '@/resource/utils/helpers';
import * as Tooltip from "@radix-ui/react-tooltip";

interface MessageProps {
  avatar: string | null, 
  content: string,
  sender_banned: number | null,
  time: string, 
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
  onTimeOutUser:(userId: number | null) => void;
  onBlockUser:(userId: number | null) => void;
}

const Message: React.FC<MessageProps> = ({ 
  avatar, 
  content, 
  sender_banned,
  time, 
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
  onEndedHighlight,
  onTimeOutUser,
  onBlockUser
}) => {
  const messageRef = useRef<HTMLDivElement | null>(null);
  const [highlight, setHighlight] = useState(false);
  const [filterModeText, setFilterModeText] = useState<string | null>(null)

  const [showTO, setShowTO] = useState(false)
  const [showBlock, setShowBlock] = useState(false)
  const [showBan, setShowBan] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  const [senderName, setSenderName] = useState<string>("")

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
    if (message?.Sender_Id && message?.Sender_Id > 100000) {
      setSenderName("anon" + String(message?.Sender_Id ?? -1).slice(-3))
    } else {
      setSenderName(message?.sender_name ?? "")
    }
  }, [message])

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

      const senderInfo = group?.members?.find(user => user.id == message.Sender_Id);
      const myMemInfo = group?.members?.find(user => user.id == userId);
      if (userId > 0 && userId < 100000) {
        if ((myMemInfo?.role_id == 1 || group.creater_id == userId  || myMemInfo?.role_id == 2) && senderInfo?.role_id != 1 && senderInfo?.role_id != 2 && isTimedout(senderInfo?.to_time ?? "") == "") {
          setShowTO(true)
        } else {
          setShowTO(false)
        }
      } else {
        setShowTO(false)
      }      
      
      if (userId > 0 && userId < 100000) {
        if (myMemInfo?.role_id != 1 && myMemInfo?.role_id != 2 && senderInfo?.role_id != 1 && senderInfo?.role_id != 2 && senderInfo?.id != userId) {
          setShowBlock(true)
        } else {
          setShowBlock(false)
        }
      } else {
        setShowBlock(false)
      }
      
      if (userId > 0 && userId < 100000) {
        if ((myMemInfo?.role_id == 1 || group.creater_id == userId  || myMemInfo?.role_id == 2) && senderInfo?.role_id != 1 && senderInfo?.role_id != 2) {
          setShowBan(true)
        } else {
          setShowBan(false)
        }
      } else {
        setShowBan(false)
      }
      

      if (userId > 0 && userId < 100000) {
        if (myMemInfo?.role_id == 1 || group.creater_id == userId) {
          setShowDelete(true)
        } else {
          if (myMemInfo?.role_id == 2) {
            if (senderInfo?.id != myMemInfo.id && senderInfo?.role_id == 2 || senderInfo?.role_id == 1) {
              setShowDelete(false)
            } else {
              setShowDelete(true)
            }
          } else {
            setShowDelete(false)
          }   
        }
      } else {
        setShowDelete(false)
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
                <span className="font-bold mr-[8px]" style={{ fontSize: font_size }}>{senderName}:</span>
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
            <p className="text-[12px]" style={{ color: date_color, fontSize: font_size * 0.9 }}>{time}</p>
            {show_reply && 
              <Tooltip.Provider>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <p className="text-[12px] cursor-pointer" style={{ color: date_color, fontSize: font_size * 0.9 }} onClick={onReplyButtonClicked}>Reply</p>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="bg-gray-800 text-white text-md rounded py-1 px-2 shadow-md z-10"
                      side="top"
                      sideOffset={5}
                    >
                      Replay message
                      <Tooltip.Arrow className="fill-gray-800" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </Tooltip.Provider>            
            }
            {showBlock &&
              <Tooltip.Provider>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <button onClick={() => onBlockUser(message?.Sender_Id ?? null)} className={`cursor-pointer`}>
                      <FontAwesomeIcon icon={faBan} className={`text-[16px] text-[#8A8A8A]`} style={{ color: date_color, fontSize: font_size }} />
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="bg-gray-800 text-white text-md rounded py-1 px-2 shadow-md z-10"
                      side="top"
                      sideOffset={5}
                    >
                      Block user
                      <Tooltip.Arrow className="fill-gray-800" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </Tooltip.Provider>
              }
            {showTO &&
              <Tooltip.Provider>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <button 
                      onClick={() => onTimeOutUser(message?.Sender_Id ?? null)} 
                      className={`${sender_banned === 1 ? "cursor-not-allowed" : "cursor-pointer"}`}
                      style={{ color: date_color, fontSize: font_size, fontWeight: 'bold' }}
                    >
                      TO
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="bg-gray-800 text-white text-md rounded py-1 px-2 shadow-md z-10"
                      side="top"
                      sideOffset={5}
                    >
                      Timeout user
                      <Tooltip.Arrow className="fill-gray-800" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </Tooltip.Provider>
              
            }
            {showPin && isPinned && 
            <Tooltip.Provider>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <button onClick={onPinButtonClicked}>
                      <FontAwesomeIcon icon={faThumbtackSlash} className='rotate-45 transition-transform' style={{ color: date_color, fontSize: font_size }} />
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="bg-gray-800 text-white text-md rounded py-1 px-2 shadow-md z-10"
                      side="top"
                      sideOffset={5}
                    >
                      Unpin Message
                      <Tooltip.Arrow className="fill-gray-800" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </Tooltip.Provider>
            }
            {showPin && !isPinned && 
            <Tooltip.Provider>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <button onClick={onPinButtonClicked}>
                      <FontAwesomeIcon icon={faThumbTack} className='rotate-45 transition-transform' style={{ color: date_color, fontSize: font_size }} />
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="bg-gray-800 text-white text-md rounded py-1 px-2 shadow-md z-10"
                      side="top"
                      sideOffset={5}
                    >
                      Pin Message
                      <Tooltip.Arrow className="fill-gray-800" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </Tooltip.Provider>
            }
            {showBan &&
              <Tooltip.Provider>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <button onClick={onBanButtonClicked} disabled={sender_banned === 1} className={`${sender_banned === 1 ? "cursor-not-allowed" : "cursor-pointer"}`}>
                      <FontAwesomeIcon icon={faBan} className={`text-[16px] ${sender_banned === 1 ? "text-[#CFCFCF]" : "text-[#8A8A8A]"}`} style={{ color: date_color, fontSize: font_size }} />
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="bg-gray-800 text-white text-md rounded py-1 px-2 shadow-md z-10"
                      side="top"
                      sideOffset={5}
                    >
                      ban User
                      <Tooltip.Arrow className="fill-gray-800" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </Tooltip.Provider>
              }
            {showDelete &&
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button onClick={onDeleteButtonClicked}>
                    <FontAwesomeIcon icon={faClose} style={{ color: date_color, fontSize: font_size }} />
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    className="bg-gray-800 text-white text-md rounded py-1 px-2 shadow-md z-10"
                    side="top"
                    sideOffset={5}
                  >
                    Delete message
                    <Tooltip.Arrow className="fill-gray-800" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>}
          </div>
        </div>
      </div>
    </Suspense>
  );
};

export default Message;
