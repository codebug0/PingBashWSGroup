'use client'

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Message from "@/components/chats/message";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faBars,
  faPaperclip,
  faVolumeUp
} from "@fortawesome/free-solid-svg-icons";
import {
  faImages,
  faFaceSmile,
} from "@fortawesome/free-regular-svg-icons";
import { useSearchParams } from "next/navigation";
import { SERVER_URL } from "@/resource/const/const";
import {  useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { chatDate } from "@/resource/utils/helpers";
import { MessageUnit } from "@/interface/chatInterface";
// import "./globals.css";

interface ChatBoxProps {
  width: number;
  height: number;
  isResponsive: boolean;
  groupName: string;
  colors: {
    background: string;
    border: string;
    title: string;
    ownerMsg: string;
    msgBg: string;
    msgText: string;
    replyText: string;
    scrollbar: string;
    inputBg: string;
    inputText: string;
    dateText: string;
    innerBorder: string;
  };
  settings: {
    userImages: boolean;
    customFontSize: boolean;
    fontSize: number;
    showTimestamp: boolean;
    showUrl: boolean;
    privateMessaging: boolean;
    roundCorners: boolean;
    cornerRadius: number;
  };
  className?: string;
}


const ChatBox: React.FC<ChatBoxProps> = ({
    width, 
    height, 
    groupName,
    isResponsive, 
    colors, 
    settings, 
    className  
}) => {

  const msgList: MessageUnit[] = useSelector((state: RootState) => state.msg.messageList)
  const [isMobile, setIsMobile] = useState(false);  

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const groupMemuPopoverRef = useRef<HTMLButtonElement>(null);
  const [currentGroupId, setCurrentGroupId] = useState<number | null>(0);

  const scrollToBottom = () => {
    scrollContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
    
    if (scrollContainerRef.current?.parentElement) {
      const container = scrollContainerRef.current.parentElement;
      container.scrollTop = container.scrollHeight;
    }
  };

  const [messages, setMessages] = useState<MessageUnit[]>([
    {
      Opposite_Photo_Name: "shyvana.png",
      Content: "I am the best champion of LOL",
      Send_Time: "2025-07-24 06:01:11",
      Receiver_Id: null,
      Id: 1,
      Sender_Id: 1,
      Read_Time: null,
      group_id: 10,
      sender_name: "Syvana",
      sender_avatar: "shyvana.png",
      sender_banned: null,
      sender_unban_request:  null,
      parent_id: null
    }, {
      Opposite_Photo_Name: "lux.png",
      Content: "I am the best Supporter of LOL",
      Send_Time: "2025-07-24 06:02:11",
      Receiver_Id: null,
      Id: 2,
      Sender_Id: 2,
      Read_Time: null,
      group_id: 10,
      sender_name: "LUX",
      sender_avatar: "lux.png",
      sender_banned: null,
      sender_unban_request:  null,
      parent_id: null
    }, {
      Opposite_Photo_Name: "garen.png",
      Content: "I am the best Figher of LOL",
      Send_Time: "2025-07-24 06:03:11",
      Receiver_Id: null,
      Id: 3,
      Sender_Id: 3,
      Read_Time: null,
      group_id: 10,
      sender_name: "Garen",
      sender_avatar: "garen.png",
      sender_banned: null,
      sender_unban_request:  null,
      parent_id: null
    }, {
      Opposite_Photo_Name: "qiana.jpg",
      Content: "I am the best Figher of LOL, not you",
      Send_Time: "2025-07-24 06:04:11",
      Receiver_Id: null,
      Id: 4,
      Sender_Id: 4,
      Read_Time: null,
      group_id: 10,
      sender_name: "Qiana",
      sender_avatar: "qiana.jpg",
      sender_banned: null,
      sender_unban_request:  null,
      parent_id: 3
    }, {
      Opposite_Photo_Name: "teemo.png",
      Content: "I am the best lovely Champion of LOL",
      Send_Time: "2025-07-24 06:05:11",
      Receiver_Id: null,
      Id: 5,
      Sender_Id: 5,
      Read_Time: null,
      group_id: 10,
      sender_name: "Teemmo",
      sender_avatar: "teemo.png",
      sender_banned: null,
      sender_unban_request:  null,
      parent_id: null
    }, {
      Opposite_Photo_Name: "morgana.jpg",
      Content: "Kidding me? Not you, It's me.",
      Send_Time: "2025-07-24 06:05:11",
      Receiver_Id: null,
      Id: 6,
      Sender_Id: 6,
      Read_Time: null,
      group_id: 10,
      sender_name: "Morgana",
      sender_avatar: "morgana.jpg",
      sender_banned: null,
      sender_unban_request:  null,
      parent_id: 2
    }, {
      Opposite_Photo_Name: "shyvana.png",
      Content: "I am the best champion of LOL",
      Send_Time: "2025-07-24 06:01:11",
      Receiver_Id: null,
      Id: 1,
      Sender_Id: 1,
      Read_Time: null,
      group_id: 10,
      sender_name: "Syvana",
      sender_avatar: "shyvana.png",
      sender_banned: null,
      sender_unban_request:  null,
      parent_id: null
    }, {
      Opposite_Photo_Name: "lux.png",
      Content: "I am the best Supporter of LOL",
      Send_Time: "2025-07-24 06:02:11",
      Receiver_Id: null,
      Id: 2,
      Sender_Id: 2,
      Read_Time: null,
      group_id: 10,
      sender_name: "LUX",
      sender_avatar: "lux.png",
      sender_banned: null,
      sender_unban_request:  null,
      parent_id: null
    }, {
      Opposite_Photo_Name: "garen.png",
      Content: "I am the best Figher of LOL",
      Send_Time: "2025-07-24 06:03:11",
      Receiver_Id: null,
      Id: 3,
      Sender_Id: 3,
      Read_Time: null,
      group_id: 10,
      sender_name: "Garen",
      sender_avatar: "garen.png",
      sender_banned: null,
      sender_unban_request:  null,
      parent_id: null
    }, {
      Opposite_Photo_Name: "qiana.jpg",
      Content: "I am the best Figher of LOL, not you",
      Send_Time: "2025-07-24 06:04:11",
      Receiver_Id: null,
      Id: 4,
      Sender_Id: 4,
      Read_Time: null,
      group_id: 10,
      sender_name: "Qiana",
      sender_avatar: "qiana.jpg",
      sender_banned: null,
      sender_unban_request:  null,
      parent_id: 3
    }, {
      Opposite_Photo_Name: "teemo.png",
      Content: "I am the best lovely Champion of LOL",
      Send_Time: "2025-07-24 06:05:11",
      Receiver_Id: null,
      Id: 5,
      Sender_Id: 5,
      Read_Time: null,
      group_id: 10,
      sender_name: "Teemmo",
      sender_avatar: "teemo.png",
      sender_banned: null,
      sender_unban_request:  null,
      parent_id: null
    }, {
      Opposite_Photo_Name: "morgana.jpg",
      Content: "Kidding me? Not you, It's me.",
      Send_Time: "2025-07-24 06:05:11",
      Receiver_Id: null,
      Id: 6,
      Sender_Id: 6,
      Read_Time: null,
      group_id: 10,
      sender_name: "Morgana",
      sender_avatar: "morgana.jpg",
      sender_banned: null,
      sender_unban_request:  null,
      parent_id: 2
    }
  ]);

  const chatStyle = {
    width: isResponsive ? '100%' : `${width}px`,
    height: isResponsive ? '100%' : `${height}px`,
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: settings.roundCorners ? `${settings.cornerRadius}px` : '4px'
  }; //

  return (
    <div className="page-container bg-white h-full bg-white" style={chatStyle}>      
      <div className="content-wrapper w-full max-lg:px-0 overflow-y-auto  h-full">
        <div className="page-content w-full flex flex-col relative  h-full">
          {/* <PageHeader /> */}
          <div className={`relative w-full h-full relative`}>            
            <section className={`flex flex-col justify-between duration-500 max-[810px]:w-full h-full`}>

              {/* Chat Right Side Header Start */}
              <nav className="shadow-lg shadow-slate-300 select-none px-[20px] py-[16px] gap-[10px] border-b flex justify-between flex-wrap z-[1]">
                <div className="flex gap-[16px] items-center">                  
                  <div>
                    <p className="flex justify-start max-[810px]:flex-col items-center gap-[5px] whitespace-nowrap truncate">
                      <span className="text-[20px] font-bold truncate w-[100%]" style={{color: colors.title}}>{groupName}</span>
                    </p>
                  </div>
                </div>
                <span className="max-[810px]:flex cursor-pointer" style={{color: colors.title}}><FontAwesomeIcon icon={faBars} className="text-[14px]" /></span>   
              </nav>
              {/* Chat Right Side Header End */}

              {/* Chat Article Start */}
              <article className="overflow-y-auto flex flex-col px-[14px] pt-[2f0px] overflow-x-hidden min-h-20" style={{background: colors.msgBg}}>
                <p className="text-center text-sm" ><button onClick={() => {}} style={{color: colors.msgText}}>Read More</button></p>
                <div className="flex flex-col gap-[6px] overflow-y-scroll" ref={scrollContainerRef} >
                  {messages?.length ? messages.map((message, idx) => {
                    return (
                        <div key={idx}>
                          <Message
                            key={`message-${idx}`}      
                            avatar={message?.sender_avatar ? `${SERVER_URL}/uploads/users/${message.sender_avatar}` : null}
                            content={`${message.Content}`}
                            sender_banned={message.sender_banned}
                            sender_unban_request={message.sender_unban_request}                            
                            time={chatDate(`${message.Send_Time}`)}
                            ownMessage={true}
                            isCreater={true}
                            read_time={message.Read_Time}
                            parentMsg={messages.find(msg => msg.Id === message.parent_id)}
                            onDelete={() => {}}
                            onBanUser={() => {}}
                            onReplyMessage={(msgId) => {}}
                            onReplyMsgPartClicked={(msgId) => {}}
                            show_avatar={settings.userImages}
                            font_size={settings.fontSize}
                            message_color={colors.msgText}
                            date_color={colors.dateText}
                            reply_message_color={colors.replyText}
                            show_reply={true}
                            showPin={false}
                            isPinned={false}
                            isTabbed={false}
                            message={message}
                            group={null}
                            userId={null}

                            onPinMessage={() => {}}
                            onEndedHighlight={() => {}}
                          />
                        </div>
                        
                      );
                  }) : ""}</div>
              </article>
              {/* Chat Article End */}
              <nav className={`relative max-[320px]:px-[5px] gap-[10px] flex flex-col border-t ${isMobile ? "p-[8px]" : "px-[12px] py-[6px]"}`}>
                <div className="flex max-sm:flex-col-reverse justify-between gap-[10px] items-center" style={{color: colors.title}}>
                  
                  <div className="flex gap-[10px] min-w-[126px] relative cursor-pointer max-[810px]:w-full">
                    <span onClick={() => {}} className="w-[24px] h-[24px]"><FontAwesomeIcon icon={faImages} className="text-[24px]" /></span>
                    <span onClick={() => {}} className="w-[24px] h-[24px]"><FontAwesomeIcon icon={faPaperclip} className="text-[24px]" /></span>
                    <span onClick={() => {}} className="w-[24px] h-[24px]"><FontAwesomeIcon icon={faFaceSmile} className="text-[24px]" /></span>
                    <span onClick={() => {}} className="w-[24px] h-[24px]"><FontAwesomeIcon icon={faVolumeUp} className="text-[24px]" /></span>
                    
                  </div>
                  <div className={`flex w-full items-center justify-between p-[6px] ${isMobile ? "pl-12px" : "pl-[16px]"} rounded-full border`} style={{background: colors.inputBg}}>
                    <input type="text" onChange={(e) => {}} className="w-full outline-none text-[14px] leading-[24px]" placeholder="Write a message" style={{background: colors.inputBg}}/>
                    <button onClick={() => {}} className="h-[30px] active:translate-y-[2px] py-[3px] max-[320px]:px-[12px] px-[26px] rounded-full text-[14px] max-[320px]:text-[10px] text-white bg-gradient-to-r from-[#BD00FF] to-[#3A4EFF]">
                      {isMobile ? <span className="hidden max-[810px]:flex"><FontAwesomeIcon icon={faPaperPlane} className="text-[16px]" /></span> : "Send"}
                    </button>
                  </div>
                </div>                
                              
              </nav>
            </section>
          </div>
        </div>
      </div>      
    </div>
  );
};

export default ChatBox;
