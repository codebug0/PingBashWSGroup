
'use client'

import Image from "next/image";
import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { ChatUser } from "@/interface/chatInterface";
import { SERVER_URL } from "@/resource/const/const";

interface ChatUserCardProps {
    id: string | number
    avatar: string
    unread?: number
    className?: string
    alt?: string
    title?: string
    infoStr?: string
    subtitle?: string
    dateString?: string
    statusColor?: string
    muted?: boolean
    onClick?: React.MouseEventHandler
}

const ChatUserCard: React.FC<ChatUserCardProps> = ({
    id, 
    avatar, 
    unread, 
    className,
    alt,
    title,
    infoStr,
    subtitle,
    dateString,
    statusColor,
    muted,
    onClick
}) => {
  // Add this function to handle the "Chat Now" button click  

  return (
    <div className={`border-b relative min-h-[72px] flex flex-row w-full truncate cursor-default ${className}`} onClick={onClick}>    
        <img className="mt-2 ml-2 w-14 h-14  rounded-full object-cover" src={avatar!}/> 
        <div className={`w-4 h-4 rounded-full absolute top-12 left-12 ${statusColor} `} />
        <div className="flex flex-col justify-center w-[calc(100%-64px)]">
            <div className="relative px-2 flex flex-row items-center mr-[80px]">
                <div className="text-[16px] truncate font-bold">{title}</div>
                <div className="text-[14px] ml-2 truncate ">{infoStr}</div>
            </div>
            <div className="text-[14px] ml-2 flex flex-col whitespace-normal break-words">{subtitle}</div>
        </div>
        <div className={`text-[12px] absolute top-[2px] right-2 w-[72px]`} >{dateString}</div>
    </div>
  );
};
export default ChatUserCard;