
'use client'
import Image from 'next/image';
import React, { Suspense } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faBan} from "@fortawesome/free-solid-svg-icons";
import Lottie from "lottie-react"
import { stickers } from './LottiesStickers';
import { MessageUnit } from '@/interface/chatInterface';

interface MessageProps {
  messageId?: number | null,
  avatar: string | null, 
  content: string, 
  senderId: number | null,
  sender: string | null, 
  sender_banned: number | null,
  sender_unban_request: number | null,
  time: string, 
  ownMessage?: boolean, 
  isCreater: boolean,
  read_time: string | null,
  parentMsg: MessageUnit | undefined | null,
  currUserid: number | null,
  onDelete: (msgId: number | null | undefined) => void;
  onBanUser: (userid: number | null) => void;
  onReplyMessage: (msgId: number | null | undefined) => void;
  onReplyMsgPartClicked: (msgId: number | null | undefined) => void;
}

const Message: React.FC<MessageProps> = ({ 
    messageId,
    avatar, 
    content, 
    senderId,
    sender, 
    sender_banned,
    sender_unban_request,
    time, 
    ownMessage, 
    isCreater,
    read_time,
    parentMsg,
    currUserid,
    onDelete,
    onBanUser,
    onReplyMessage,
    onReplyMsgPartClicked
   }) => {

  const onBanButtonClicked = () => {
    onBanUser(senderId);
  }

  const onDeleteButtonClicked = () => {
    onDelete(messageId);
  }

  const onReplyButtonClicked = () => {    
    onReplyMessage(messageId);
  }

  const getSticker = (content: string) => {
    const stickerName = content.slice("sticker::".length);
    const sticker = stickers.find((stk) => stk.name === stickerName);
    return sticker?.content;
  }

  const getReplyMsgContentHtml = (content: string | null) => {
    let type = "text";
    let value = content;
    if (content!.indexOf("<img") > -1) {
      type = "img"; value= "Photo";
    }
    if (content!.indexOf("gif::https://") > -1 || content!.indexOf(".gif") > -1 && content!.indexOf(" ") < 0 && content!.indexOf("https://") > -1) {
      type = "gif"; value= "Gif";
    }
    if (content!.indexOf("sticker::") > -1) {
      type = "sticker"; value= "Sticker";
    }
    if (type === "text") {
      return  <div className='text-[14px] mt-[3px]'>{value}</div>;
    } else {
      return  <div className='text-[13px] mt-[3px] text-gray-400'>{value}</div>;
    }
  }

  const getReplyMsgImgHtml = (content: string | null) => {
    if (content!.indexOf("<img") > -1) {
      let contentStr = content!.replace("<img", "<img style='height: 30px'")
      return <span
        className="inline-block w-fit ml-[6px] h-[30px]"
        dangerouslySetInnerHTML={{ __html: contentStr! }}
      />;
    }
    if (content!.indexOf("gif::https://") > -1 ) {
      return <img src={content!.slice("gif::".length)} className="h-[30px] ml-[6px]" /> 
    }

    if (content!.indexOf(".gif") > -1 && content!.indexOf("https://") > -1 && content!.indexOf(" ") < 0) {
      return <img src={content!} className="h-[30px] ml-[6px]" />
    }
    
    if (content!.indexOf("sticker::") > -1 ) {
      return <Lottie animationData={getSticker(content!)} style={{height: 30, marginLeft: 6 }} /> 
    }

    return null;
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="chat-box">
        <div className="flex justify-between items-start relative">
          {/* Left Side: Avatar + Name + Message */}
          <div className="flex items-start gap-2">
            {/* Avatar */}
            <Image
              className="my-2 w-[40px] h-[40px] rounded-full object-cover"
              src={avatar || "/assets/default-user.svg"}
              alt="user"
              width={40}
              height={40}
            />

            {/* Name and Message on same line */}
            <div className="flex items-start gap-1 flex-nowrap">
              <div className={`relative ${content.indexOf("<img") > -1 && "flex"} text-[15px] text-[#010101]  mt-[16px]`}>
                <span className="text-[15px] font-bold text-[#010101] mr-[8px]">{sender}:</span>
                {parentMsg && 
                <div className="bg-[#1e81b022] flex-row-center rounded-[8px] overflow-y-hidden h-[42px] cursor-pointer"
                  onClick={() => onReplyMsgPartClicked(parentMsg.Id)}>
                  <div className="h-[45px] w-[4px] bg-[#1e81b0]"></div>
                  {getReplyMsgImgHtml(parentMsg.Content)}
                  <div className='ml-[8px] p-[4px] mr-[6px]'>
                    <div className='font-bold text-[13px] text-[#1e81b0]'>
                      {parentMsg.sender_name}
                    </div>
                    <div>
                      {getReplyMsgContentHtml(parentMsg.Content)}
                    </div>
                  </div>
                </div>}
                {content.indexOf("<img") > -1 
                ? <span
                  className="inline-block w-fit"
                  dangerouslySetInnerHTML={{ __html: content }}
                /> 
                : content.indexOf("gif::https://") > -1 
                  ? <img src={content.slice("gif::".length)} className="w-40" /> 
                  : content.indexOf("sticker::") > -1 
                    ? <Lottie animationData={getSticker(content)} style={{ width: 120, height: 120 }} />  
                    : content.indexOf(".gif") > -1 ? <img src={content} className="w-40" /> : content}
                {/* {read_time && (
                  <Image
                    className="w-[14px] absolute bottom-[3px] right-[-16px]"
                    src="/assets/chat-check.svg"
                    alt=""
                    width={14}
                    height={14}
                  />              
                )} */}
              </div>
            </div>
          </div>

          {/* Time on right */}
          <div className="h-[16px] flex items-center  whitespace-nowrap absolute top-0 right-0 gap-2 mr-[12px]">
            {currUserid != 0 && <p className="text-[12px] cursor-pointer text-[#8A8A8A] pr-[8px]"
              onClick={onReplyButtonClicked}>Reply</p>}
            <p className="text-[12px] text-[#8A8A8A]">{time}</p>
            {isCreater && !ownMessage && 
            <button 
              onClick={onBanButtonClicked} disabled={sender_banned == 1 ? true : false} className={`${sender_banned == 1 ? "cursor-not-allowed" : "cursor-pointer"}`}>
                <FontAwesomeIcon icon={faBan} className={`text-[16px] ${sender_banned == 1 ? "text-[#CFCFCF]" : "text-[#8A8A8A]"}`}/>
            </button>}
            {isCreater && 
            <button onClick={onDeleteButtonClicked}>
              <FontAwesomeIcon icon={faClose} className="text-[16px] text-[#8A8A8A]"/>
            </button>}
          </div>
        </div>

        {/* Bottom divider */}
        <div className="bg-[#CFCFCF] h-[0.7px] mt-1 line-bot-match"></div>
      </div>
    </Suspense>
  );
};
export default Message;