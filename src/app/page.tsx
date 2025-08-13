'use client'

import React, { Suspense, useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import EmojiPicker from "@/components/chats/EmojiPicker";
import Message from "@/components/chats/message";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  getGroupHistory, 
  getGroupHistoryAnon,
  sendGroupMsg, 
  socket, 
  deleteGroupMsg,
  banGroupUser,
  unbanGroupUser,
  registerAsAnon,
  loginAsReal,
  updateGroupFavInfo,
  updateGroupChatLimitations,
  pinChatmessage,
  unpinChatmessage,
  clearGroupChat,
  getPinnedMessages,
  updateGroupModerators,
  updateGroupModPermissions,
  updateCensoredWords,
  unbanGroupUsers,
  sendGroupNotify,
  updateGroupChatboxConfig,
  timeoutGroupUser,
  blockUser,
  getBlockedUsers,
  getGroupMessages,
  userLoggedOut,
  getGroupOnlineUsers
 } from "@/resource/utils/chat";
import { Popover, PopoverTrigger, PopoverContent } from "@nextui-org/popover";
import ChatConst from "@/resource/const/chat_const";
import { 
  CHAT_BOX_HEIGHT, 
  CHAT_BOX_WIDTH, 
  SELECTED_GROUP_ID, 
  SERVER_URL, 
  TOKEN_KEY, 
  USER_ID_KEY 
} from "@/resource/const/const";
import { useDispatch, useSelector } from "react-redux";
import { chatDate, containsURL, getCensoredMessage, getCensoredWordArray, isTimedout } from "@/resource/utils/helpers";
import { MessageUnit, User, ChatOption, ChatGroup, ChatUser } from "@/interface/chatInterface";
import toast from "react-hot-toast";
import messages from "@/resource/const/messages";
import axios from "axios";
import PreLoading from "@/components/mask/preLoading";
import { setIsLoading } from "@/redux/slices/stateSlice";
import ConfirmPopup from "@/components/ConfirmPopup";
import { SigninPopup } from "@/components/SigninPopup";
import Lottie from "lottie-react"
import { stickers } from '../components/chats/LottiesStickers';
import { useSound } from "@/components/chats/useSound";
import "./globals.css";
import httpCode from "@/resource/const/httpCode";
import { 
  faPaperPlane,
  faBars,
  faClose,
  faReply,
  faPaperclip,
  faVolumeUp,
  faFilter,
  faUser,
  faSliders,
  faL
} from "@fortawesome/free-solid-svg-icons";
import {
  faImages,
  faFaceSmile,
} from "@fortawesome/free-regular-svg-icons";
import { 
  ALLOW_USER_MSG_STYLE, 
  BG_COLOR, 
  BORDER_COLOR, 
  CORNOR_RADIUS, 
  FONT_SIZE, 
  INPUT_BG_COLOR, 
  MSG_BG_COLOR, 
  MSG_COLOR, 
  MSG_DATE_COLOR, 
  OWNER_MSG_COLOR, 
  REPLY_MGS_COLOR, 
  ROUND_CORNORS, 
  SCROLLBAR_COLOR, 
  SHOW_USER_IMG, 
  TITLE_COLOR 
} from '@/resource/const/const';
import { darkenColor } from "@/resource/utils/colors";
import SwitchButton from "@/components/SwitchButton";
import { v4 as uuidv4 } from 'uuid';
import FilterWidget from "@/components/groupAdmin/FilterWidget";
import ChatLimitPopup from "@/components/groupAdmin/ChatLimitPopup";
import ManageChatPopup from "@/components/groupAdmin/ManageChatPopup";
import ModeratorsPopup from "@/components/groupAdmin/ModeratorsPopup";
import CensoredContentsPopup from "@/components/groupAdmin/CensoredContentsPopup";
import BannedUsersPopup from "@/components/groupAdmin/BannedUsersPopup";
import PinnedMessagesWidget from "@/components/chats/PinnedMessagesWidget";
import SendNotificationPopup from "@/components/groupAdmin/SendNotificationPopup";
import GroupCreatPopup from "@/components/groupAdmin/groupCreatPopup";
import { GroupPropsEditWidget } from "@/components/chats/GroupPropsEditWidget";
import { SignupPopup } from "@/components/SignupPopup";
import GroupOnlineUsersPopup from "@/components/groupAdmin/GroupOnlineUsersPopup";
import { Gruppo } from "next/font/google";


interface Attachment {
  type: string | null;
  url: string | null;
}

interface ChatWidgetConfig {
  sizeMode: 'fixed' | 'responsive';
  width: number;
  height: number;
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
    allowUserMessageStyles: boolean;
    customFontSize: boolean;
    fontSize: number;
    showTimestamp: boolean;
    showUrl: boolean;
    privateMessaging: boolean;
    roundCorners: boolean;
    cornerRadius: number;
  };
}

const ChatsContent: React.FC = () => {
  // Auth Params
  const [showSigninPopup, setShowSigninPopup] = useState<boolean>(false);
  const [showSignupPopup, setShowSignupPopup] = useState<boolean>(false);

  const [inputMsg, setInputMsg] = useState("")
  const [lastChatDate, setLastChatDate] = useState(1)
  const [showEmoji, setShowEmoji] = useState(false)
  const [attachment, setAttachment] = useState<Attachment>()

  const [groupMsgList, setGroupMsgList] = useState<MessageUnit[]>([])

  const [group, setGroup] = useState<ChatGroup>();
  const [favGroups, setFavGroups] = useState<ChatGroup[]>([]);

  const dispatch = useDispatch()
  const imageUploadRef = useRef<HTMLInputElement | null>(null)
  const fileUploadRef = useRef<HTMLInputElement | null>(null)
  const inputMsgRef = useRef<HTMLInputElement | null>(null)
  const [isMobile, setIsMobile] = useState(false);  
  
  const [openUnbanReqConfirmPopup, setOpenUnbanReqConfirmPopup] = useState(false);

  const [deleteMsgId, setDeleteMsgId] = useState<number | null>(null);
  const [openMsgDeleteConfirmPopup, setOpenMsgDeleteConfirmPopup] = useState(false);

  const [banUserId, setBanUserId] = useState<number | null>(null);
  const [openBanUserConfirmPopup, setOpenBanUserConfirmPopup] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const groupMemuPopoverRef = useRef<HTMLDivElement>(null);
  const msgItemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [replyMsg, setReplyMsg] = useState<MessageUnit | null | undefined>();
  const [showMsgReplyView, setShowMsgReplyView] = useState<boolean | null>(null);
  const playBell = useSound("/sounds/sound_bell.wav");
  const [currentUserId, setCurrentUserId] = useState<number>(0);
  const [groupMenuOptions, setGroupMenuOptions] = useState<{ id: number; name: string }[]>([])

  const [anonToken, setAnonToken] = useState<string | null>(null)
  
  const soundMenuPopoverRef = useRef<HTMLImageElement>(null);
  const filterPopoverRef = useRef<HTMLImageElement>(null);

  const [stayAsAnon, setStayAsAnon] = useState(false)
  const [showSigninView, setShowSigninView] = useState(false)

  const [mySoundOptionId, setMySoundOptionId] = useState<number | null | undefined>(null);
  const [soundSelectedOption, setSoundSelectedOption] = useState<string | null | undefined>(null);
  const soundSettingOptions = [
    {val: "every", name: "On every message",  option_id: 1},
    {val: "reply", name: "Only on @replies",  option_id: 2},
    {val: "never", name: "Never",  option_id: 0}
  ];

  

  const [groupConfig, setGroupConfig] = useState<ChatWidgetConfig>({
    sizeMode: 'fixed',
    width: CHAT_BOX_WIDTH,
    height: CHAT_BOX_HEIGHT,
    colors: {
      background: BG_COLOR,
      border: BORDER_COLOR,
      title: TITLE_COLOR,
      ownerMsg: OWNER_MSG_COLOR,
      msgBg: MSG_BG_COLOR,
      replyText: REPLY_MGS_COLOR,
      msgText: MSG_COLOR,
      scrollbar: SCROLLBAR_COLOR,
      inputBg: INPUT_BG_COLOR,
      inputText: '#000000',
      dateText: MSG_DATE_COLOR,
      innerBorder: '#CC0000'
    },
    settings: {
      userImages: SHOW_USER_IMG,
      allowUserMessageStyles: ALLOW_USER_MSG_STYLE,
      customFontSize: false,
      fontSize: FONT_SIZE,
      showTimestamp: false,
      showUrl: false,
      privateMessaging: false,
      roundCorners: ROUND_CORNORS,
      cornerRadius: CORNOR_RADIUS
    }
  });

  const [groupEditConfig, setGroupEditConfig] = useState<ChatWidgetConfig>({
    sizeMode: 'fixed',
    width: CHAT_BOX_WIDTH,
    height: CHAT_BOX_HEIGHT,
    colors: {
      background: BG_COLOR,
      border: BORDER_COLOR,
      title: TITLE_COLOR,
      ownerMsg: OWNER_MSG_COLOR,
      msgBg: MSG_BG_COLOR,
      replyText: REPLY_MGS_COLOR,
      msgText: MSG_COLOR,
      scrollbar: SCROLLBAR_COLOR,
      inputBg: INPUT_BG_COLOR,
      inputText: '#000000',
      dateText: MSG_DATE_COLOR,
      innerBorder: '#CC0000'
    },
    settings: {
      userImages: SHOW_USER_IMG,
      allowUserMessageStyles: ALLOW_USER_MSG_STYLE,
      customFontSize: false,
      fontSize: FONT_SIZE,
      showTimestamp: false,
      showUrl: false,
      privateMessaging: false,
      roundCorners: ROUND_CORNORS,
      cornerRadius: CORNOR_RADIUS
    }
  });

  const [isDarkMode, setDarkMode] = useState(false);
  const [hideChat, setHideChat] = useState(false)
// Parameters for the Admin Tools
  const adminManagePopoverRef = useRef<HTMLImageElement>(null);
  const [openChatLimitationPopup, setOpenChatLimitationPopup] = useState(false);
  const [openBannedUsersWidget, setOpenBannedUsersWidget] = useState(false);
  const [openModeratorsWidget, setOpenModeratorsWidget] = useState(false);
  const [openCensoredPopup, setOpenCensoredPopup] = useState(false);
  const [openManageChatPopup, setOpenManageChatPopup] = useState(false);
  const [showPinnedMessagesView, setShowPinnedMessageView] = useState(false);
  const [groupBannedUsers, setGroupBannedUsers] = useState<ChatUser[]>([]);
  const [pinnedMsgIds, setPinnedMsgIds] = useState<number[]>([]);
  const [pinnedMessages, setPinnedMessages] = useState<MessageUnit[]>([]);
  const [tabbedPinMsgId, setTabbedPinMsgId] = useState<number | null>(null);
  const [adminManageOptions, setAdminManageOptions] = useState<{ id: string; name: string }[]>([]);
  const [filterOptions, setFilterOption] = useState<{ id: number; name: string }[]>([]);
  const [filterMode, setFilterMode]  = useState(0)
  const [filteredUser, setFilteredUser] = useState<ChatUser | null>(null)  // For the user selected in Filter mode for 1 on 1 Mode
  const [openSendGroupNotification, setOpenSendGroupNotification] = useState(false)

  const [filteredMsgList, setFilteredMsgList] = useState<MessageUnit[]>([])
  const [filteredPrevMsgList, setFilteredPrevMsgList] = useState<MessageUnit[]>([])
  const [blockedUserIds, setBlockedUserIds] = useState<number[]>([])

  const [openEditGroupPop, setOpenEditGroupPop] = useState(false);
  const [openGroupOnlineUsersPopup, setOpenGroupOnlineUsersPopup] = useState(false)
  const [showOnlineUserCount, setShowOnlineUserCount] = useState(false)
  
  const [isBannedUser, setIsBanneduser] = useState(false);
  const [canPost, setCanPost] = useState(true)
  const [canPinMessage, setCanPinMessage] = useState(false);  

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [canSend, setCanSend] = useState(true);
  const [cooldown, setCooldown] = useState(0);
  const hasShownGroupNotify = useRef(false);
  const [groupOnlineUserIds, setGroupOnlineUserIds] = useState<number[]>([])
  //--------------------------


  const getSubDomain = () => {
    const hostname = window.location.hostname; // e.g., "blog.example.com"
    const parts = hostname.split('.');

    // Handle cases like "blog.example.com" vs "localhost" vs "co.uk"
    let subdomain = '';
    if (parts.length > 1) {
      subdomain = parts.slice(0, 1).join('.'); // e.g., "blog"
    } else {
      subdomain = ''; // No subdomain, e.g., "example.com" or "localhost"
    }
    return subdomain;
  }  

  const getBrowserFingerprint = (): string => {
    return [
      navigator.userAgent,
      navigator.language,
      screen.width,
      screen.height,
      screen.colorDepth,
      Intl.DateTimeFormat().resolvedOptions().timeZone
    ].join('::');
  };

  const hashStringToNumber = (str: string): number => {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 33) ^ str.charCodeAt(i);
    }
    return Math.abs(hash >>> 0); // Unsigned 32-bit number
  };

  const getAnonId = () => {
    const fingerprint = getBrowserFingerprint();
    const anonId = hashStringToNumber(fingerprint);
    return anonId % 1000000000;
  }

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    }; 
    const token = localStorage.getItem(TOKEN_KEY);
    const groupId = getChatGroupID();
    const userId = getCurrentUserId();
    setCurrentUserId(userId);
    if (getCurrentUserId() != 0 && token && groupId) {   
      loginAsReal(token, groupId, getAnonId());
      getGroupMessages(token, groupId)
    } else {
      registerAsAnon(getAnonId());          
    }    
    checkScreenSize();
    const interval = setInterval(getCurrentGroupOnlineUsers, 1 * 60 * 1000);
    window.addEventListener('resize', checkScreenSize);
    return () => {
      clearInterval(interval)
      window.removeEventListener('resize', checkScreenSize);
    }
  }, []);

  useEffect(() => {
    const getBrowserUUID = () => {
      let uuid = localStorage.getItem("browser_uuid");
      if (!uuid) {
        uuid = uuidv4();
        localStorage.setItem("browser_uuid", uuid);
      } 
      return uuid;
    }

    const getAnonToken = () => {
      const groupName = getSubDomain();    
      const browserUUid = getBrowserUUID();
      const anontoken = "anonuser" + groupName + browserUUid;
      setAnonToken(anontoken)
      return anontoken
    }
    
    const handleLogginAsAnon = (data: any) => {
      console.log("== handleLogginAsAnon ===")
      if (data.success == "success") {
        registerAnon(getAnonToken(), getAnonId(), getSubDomain());
      }
    };   

    const handleGetGroupHistory = (data: MessageUnit[]) => {
      // dispatch(setMessageList([...data]));
      setGroupMsgList([...data])
    }

    const handleSendGroupNotify = (msg: string | null) => {  
      if (!hasShownGroupNotify.current) {
        toast.success("Sent notifications successfully")
        hasShownGroupNotify.current = true
      }      
    }

    // Register socket listener
    socket.on(ChatConst.USER_LOGGED_AS_ANNON, handleLogginAsAnon);
    socket.on(ChatConst.SEND_GROUP_NOTIFY, handleSendGroupNotify)

    socket.on(ChatConst.GET_GROUP_HISTORY, handleGetGroupHistory)

    // Cleanup to avoid memory leaks and invalid state updates
    return () => {
      socket.off(ChatConst.USER_LOGGED_AS_ANNON, handleLogginAsAnon);
      socket.off(ChatConst.GET_GROUP_HISTORY, handleGetGroupHistory)
      socket.off(ChatConst.SEND_GROUP_NOTIFY, handleSendGroupNotify)
    };
  }, []);

  useEffect(() => {
    if (!isDarkMode) {
      setGroupConfig({
        ...groupConfig,
        sizeMode: group?.size_mode ?? "fixed",
        width: group?.frame_width ?? CHAT_BOX_WIDTH,
        height: group?.frame_height ?? CHAT_BOX_HEIGHT,
        colors: {
          ...groupConfig.colors,
          background: group?.bg_color ?? BG_COLOR,
          title: group?.title_color ?? TITLE_COLOR,
          msgBg: group?.msg_bg_color ?? MSG_BG_COLOR,
          replyText: group?.reply_msg_color ?? REPLY_MGS_COLOR,
          msgText: group?.msg_txt_color ?? MSG_COLOR,
          dateText: group?.msg_date_color ?? MSG_DATE_COLOR,      
          inputBg: group?.input_bg_color ?? INPUT_BG_COLOR,
        },
        settings: {
          ...groupConfig.settings,
          userImages: group?.show_user_img ?? SHOW_USER_IMG,
          customFontSize: group?.custom_font_size ?? false,
          fontSize: group?.font_size ?? FONT_SIZE,
          roundCorners: group?.round_corners ?? false,
          cornerRadius: group?.corner_radius ?? CORNOR_RADIUS
        }
      });
    } else {
      setGroupConfig({
        ...groupConfig,
        sizeMode: group?.size_mode ?? "fixed",
        width: group?.frame_width ?? CHAT_BOX_WIDTH,
        height: group?.frame_height ?? CHAT_BOX_HEIGHT,
        colors: {
          ...groupConfig.colors,
          background: darkenColor(group?.bg_color ?? BG_COLOR),
          title: darkenColor(group?.title_color ?? TITLE_COLOR),
          msgBg: darkenColor(group?.msg_bg_color ?? MSG_BG_COLOR),
          replyText: darkenColor(group?.reply_msg_color ?? REPLY_MGS_COLOR),
          msgText: darkenColor(group?.msg_txt_color ?? MSG_COLOR),
          dateText: darkenColor(group?.msg_date_color ?? MSG_DATE_COLOR),      
          inputBg: darkenColor(group?.input_bg_color ?? INPUT_BG_COLOR),
        },
        settings: {
          ...groupConfig.settings,
          userImages: group?.show_user_img ?? SHOW_USER_IMG,
          customFontSize: group?.custom_font_size ?? false,
          fontSize: group?.font_size ?? FONT_SIZE,
          roundCorners: group?.round_corners ?? false,
          cornerRadius: group?.corner_radius ?? CORNOR_RADIUS
        }
      });
    }   
    getCurrentGroupOnlineUsers()
  }, [group, isDarkMode]);

  useEffect(() => {
    dispatch(setIsLoading(false)); 
    let token = localStorage.getItem(TOKEN_KEY);
    if (!token) token = anonToken
    if (token && group) {
      setPinnedMsgIds([]);
      getPinnedMessages(token, group?.id)
    }
    setShowMsgReplyView(false);
    setFilterMode(0)
    if (group && currentUserId) {
      getMyBlockedUsers();
    }
  }, [group?.id, currentUserId]);

  useEffect(() => {
    dispatch(setIsLoading(false)); 
    setGroupBannedUsers(group?.members?.filter(mem => mem.banned == 1) ?? [])
    if (group) {
      const myMemInfo = group?.members?.find(mem => mem.id == getCurrentUserId());

      // Set Admin / Mod tools list
      const options: { id: string; name: string }[] = [];
      if (myMemInfo?.id == group?.creater_id || myMemInfo?.role_id == 2 && myMemInfo.chat_limit) {
        options.push({ id: "1", name: "Chat Limitations" });
      }
      if (myMemInfo?.id == group?.creater_id || myMemInfo?.role_id == 2 && myMemInfo.manage_chat) {
        options.push({ id: "2", name: "Manage Chat" });
      }
      if (myMemInfo?.id == group?.creater_id || myMemInfo?.role_id == 2 && myMemInfo.manage_mods) {
        options.push({ id: "3", name: "Manage Moderators" });
      }
      if (myMemInfo?.id == group?.creater_id || myMemInfo?.role_id == 2 && myMemInfo.manage_censored) {
        options.push({ id: "4", name: "Censored Content" });
      }
      if (myMemInfo?.id == group?.creater_id || myMemInfo?.role_id == 2 && myMemInfo.ban_user) {
        options.push({ id: "5", name: "Banned Users" });
      }
      setAdminManageOptions(options);  
      
      // Set filter option based on user role
      const filterOptions: { id: number; name: string }[] = [];
      filterOptions.push({ id: 0, name: "Public Mode" });
      filterOptions.push({ id: 1, name: "1 on 1 Mode" });
      if (myMemInfo?.id == group?.creater_id || myMemInfo?.role_id == 2) {
        filterOptions.push({ id: 2, name: "Mods Mode" });
      }
      setFilterOption(filterOptions)
      
      // Is Banner init
      setIsBanneduser(myMemInfo?.banned == 1)

      // Init Addmin tools variables
      if (group.post_level == null || group.post_level == 0) {
        setCanPost(true)
      } else if (group.post_level == 1 ) {
        if (myMemInfo?.id && myMemInfo?.id < 1000000) {
          setCanPost(true)
        } else {
          setCanPost(false)
        }
      } else if (group.post_level == 2) {
        if (myMemInfo?.role_id == 1 || myMemInfo?.role_id == 2) {
          setCanPost(true)
        } else {
          setCanPost(false)
        }
      }

      if (myMemInfo?.role_id == 1 || myMemInfo?.role_id == 2 ) {
        setCanPinMessage(true)
      } else {
        setCanPinMessage(false)
      }      
    }

  }, [group, currentUserId])

  useEffect(() => {
    const pinnedMsgs = filteredMsgList.filter(msg => pinnedMsgIds.includes(msg.Id ?? -1))
    setPinnedMessages(pinnedMsgs);
  }, [filteredMsgList, pinnedMsgIds]);

  useEffect(() => {
    const myMemInfo = group?.members?.find(mem => mem.id == currentUserId)
    setFilteredPrevMsgList(filteredMsgList)
    let newMsgs = []
    if (currentUserId == null) {
      newMsgs = groupMsgList.filter(msg => msg.Receiver_Id === null)      
    } else {
      if (myMemInfo?.role_id == 1 || myMemInfo?.role_id == 2) {
        newMsgs = groupMsgList.filter(msg => msg.Receiver_Id == null || msg.Receiver_Id == 1 || msg.Receiver_Id == currentUserId || msg.Sender_Id == currentUserId)        
      } else {
        newMsgs = groupMsgList.filter(msg => msg.Receiver_Id == null || msg.Receiver_Id == currentUserId || msg.Sender_Id == currentUserId)
      }
    }

    if (myMemInfo?.role_id != 1 && myMemInfo?.role_id != 2 && group?.creater_id != getCurrentUserId()) {
      if (blockedUserIds?.length > 0) {
        newMsgs = newMsgs.filter(msg => {
          const senderInfo = group?.members?.find(u => u.id === msg.Sender_Id)
          if (senderInfo?.role_id == 1 || senderInfo?.role_id == 2) return true
          return !blockedUserIds.includes(msg.Sender_Id ?? -1)        
        })
      }
    }
    setFilteredMsgList(newMsgs)

    const prevLength = filteredMsgList.length;
    const newLength = newMsgs.length;
    if (prevLength + 1 == newLength) {
      if (newMsgs[newLength - 1].Sender_Id != currentUserId) {        
        if (mySoundOptionId == 1) {
          console.log(" === Played Bell ==== ")
          playBell();
        } else if (mySoundOptionId == 2) {
          if (newMsgs[newLength - 1].parent_id != null) {
            const toMsgId = newMsgs[newLength - 1].parent_id;
            const toMsg = filteredMsgList.find(msg =>  msg.Id == toMsgId);
            if (toMsg?.Sender_Id == getCurrentUserId()) {
              console.log(" === Played Bell ==== ")
              playBell();
            }
          }
        }          
      }
    }
  }, [groupMsgList, currentUserId, blockedUserIds, group])

  useEffect(() => {
    let isMounted = true;

    const handleGetFavGroups = (data: ChatGroup[]) => {
      if (!isMounted) return;
      setFavGroups(data);
    };    
    
    if (currentUserId == 0 || currentUserId < 0) {
      setStayAsAnon(false)
      setShowSigninView(true)
    }
    

    // Register handlers
    socket.on(ChatConst.GET_FAV_GROUPS, handleGetFavGroups);

    // Receive updated message afer delete group message.
    socket.on(ChatConst.GET_PINNED_MESSAGES, handleGetPinnedMesssages)   
    socket.on(ChatConst.USER_LOGGED_WILD_SUB, handleLoginAsWildSub)
    socket.on(ChatConst.GET_BLOCKED_USERS_INFO, handleGetBlockedUsers);
    
    // Cleanup
    return () => {
      isMounted = false;
      socket.off(ChatConst.GET_FAV_GROUPS, handleGetFavGroups);
      socket.off(ChatConst.GET_PINNED_MESSAGES, handleGetPinnedMesssages)
      socket.off(ChatConst.USER_LOGGED_WILD_SUB, handleLoginAsWildSub)
      socket.off(ChatConst.GET_BLOCKED_USERS_INFO, handleGetBlockedUsers);
    };
  }, [currentUserId]);

  const handleLoginAsWildSub = (group: ChatGroup) => {
    if (group) {
      localStorage.setItem(SELECTED_GROUP_ID, group?.id?.toString())
      setGroup(group)
    }    
  }

  const handleGetGroupOnlineUsers = (data: number[]) => {
    console.log("==== Online Users === ", data)
    console.log("=== Group ==", group)
    setGroupOnlineUserIds(data)
  }

  const handleGetGroupMessages = (data: MessageUnit[]) => {
    setGroupMsgList(data)
  }

  const handleGetPinnedMesssages = (msgIds: number[]) => {
      setPinnedMsgIds(msgIds);
    } 

  const handleBanGroupUser = (userId: number) => {
    // const updateMsgList = msgList.map(msg => msg.Sender_Id == userId ? {...msg, sender_banned: 1} : msg);
    const updateMsgList = groupMsgList.filter(msg => msg.Sender_Id != userId);
    setGroupMsgList(updateMsgList)
    // dispatch(setMessageList(updateMsgList));
  }

  const handleUnbanGroupUser = (userId: number) => {
    const updateMsgList = groupMsgList.map(msg => msg.Sender_Id == userId ? {...msg, sender_banned: 0} : msg);
    // dispatch(setMessageList(updateMsgList));
    setGroupMsgList(updateMsgList)
  }

  const handleUnbanGroupUsers = (userIds: number[] | null) => {
    const updateMsgList = groupMsgList.map(msg => userIds?.includes(msg.Sender_Id ?? -1) ? {...msg, sender_banned: 0} : msg);
    // dispatch(setMessageList(updateMsgList));
    setGroupMsgList(updateMsgList)
  }

  const handleGroupUpdated = (updatedGroup: ChatGroup) => {
    dispatch(setIsLoading(false));
    if (group?.id == updatedGroup.id) {
      localStorage.setItem(SELECTED_GROUP_ID, updatedGroup.id.toString())
      setGroup(updatedGroup)
    }
    if (favGroups.find(grp => grp.id == updatedGroup.id)) {
      setFavGroups(favGroups.map(grp => grp.id == updatedGroup.id ? updatedGroup : grp))
    }
  }

  const handleDeleteGroupMsg = (data: number) => {
    const updateMsgList = groupMsgList.filter(msg => msg.Id != data);
    // dispatch(setMessageList([...updateMsgList]))
    setGroupMsgList(updateMsgList)
  }

  const handleSendGroupMsg = (data: MessageUnit[]) => {
    const groupId = data?.length && data[data.length - 1].group_id; 
    if (groupId === group?.id) {
      const newList = mergeArrays(groupMsgList, data);
      // dispatch(setMessageList([...newList]));    
      setGroupMsgList(newList)    
    }
  }

  const handleGetGroupBlockedUsers = (data: number[]) => {
    dispatch(setIsLoading(false));
    setBlockedUserIds(data)
  }

  const handleGetBlockedUsers = (data: User[]) => {
    dispatch(setIsLoading(false));
    setBlockedUserIds(data.map(user => user.Opposite_Id))
  }

  const handleClearGroupChat = (groupId: number) => {
    if (groupId == group?.id) {
      // dispatch(setMessageList([]));
      setGroupMsgList([])
    }
    dispatch(setIsLoading(false));
  }  

  const handleExpired = () => {
    localStorage.clear()
    dispatch(setIsLoading(false));
    setShowSigninPopup(true);
  }  
  
  socket.on(ChatConst.GET_GROUP_ONLINE_USERS, handleGetGroupOnlineUsers)
  socket.on(ChatConst.GET_GROUP_MSG, handleGetGroupMessages)
  socket.on(ChatConst.BAN_GROUP_USER, handleBanGroupUser);
  socket.on(ChatConst.UNBAN_GROUP_USER, handleUnbanGroupUser);
  socket.on(ChatConst.UNBAN_GROUP_USERS, handleUnbanGroupUsers);
  // Receive the message afer sending the message.
  socket.on(ChatConst.SEND_GROUP_MSG, handleSendGroupMsg);
  socket.on(ChatConst.DELETE_GROUP_MSG, handleDeleteGroupMsg);
  socket.on(ChatConst.GROUP_UPDATED, handleGroupUpdated);
  socket.on(ChatConst.GET_GROUP_BLOCKED_USERS, handleGetGroupBlockedUsers);
  
  socket.on(ChatConst.CLEAR_GROUP_CHAT, handleClearGroupChat);
  socket.on(ChatConst.EXPIRED, handleExpired)    

  useEffect(() => {
    const options: { id: number; name: string }[] = [];
    options.push({id: 1, name: "Copy Group Link"})
    if (!stayAsAnon) {
      options.push({id: 2, name: favGroups.find(grp => grp.id == group?.id) == null ? "Add to My Groups" : "Remove from My Groups"})
    }
    options.push({id: 3, name: hideChat ? "Show Chat" : "Hide Chat"})
    if (currentUserId == group?.creater_id) {
      options.push({id: 4, name: "Send a Notification"})
      options.push({id: 5, name: "Edit Chatbox Style"})
    } 
    if (stayAsAnon) {
      options.push({id: 7, name: "Log in"})
    } else {
      options.push({id: 6, name: "Log out"})
    }
    setGroupMenuOptions(options)
    // if (currentUserId == group?.creater_id) {
    //   setGroupMenuOptions([
    //     {id: 1, name: "Copy Group Link"},
    //     {id: 2, name: favGroups.find(grp => grp.id == group?.id) == null ? "Add to My Groups" : "Remove from My Groups"},
    //     {id: 3, name: hideChat ? "Show Chat" : "Hide Chat"},
    //     {id: 4, name: "Send a Notification"},
    //     {id: 5, name: "Edit Chatbox Style"},
    //     {id: 6, name: "Log out"}
    //   ])
    // } else {
    //   setGroupMenuOptions([
    //     {id: 1, name: "Copy Group Link"},
    //     {id: 2, name: favGroups.find(grp => grp.id == group?.id) == null ? "Add to My Groups" : "Remove from My Groups"},
    //     {id: 3, name: hideChat ? "Show Chat" : "Hide Chat"},
    //     {id: 6, name: "Log out"}
    //   ])
    // }
    
  }, [favGroups, group, hideChat, currentUserId]);

  // To get the initial data for the users and the categegories for the dashboard
  const registerAnon = useCallback(async (token: string, anonId: number, groupName: string) => {
    console.log("===registerAnon===")
    try {
      dispatch(setIsLoading(true));
      const res = await axios.post(`${SERVER_URL}/api/private/add/groups/addanon`,
        {
          userId: anonId,
          groupName
        },
        {
          headers: {
            "Accept": "application/json",
            "Content-type": "application/json",
            Authorization: token,
          },
        }
      );
      if (res.data.group.length > 0) {
        dispatch(setIsLoading(false));
        toast.error(groupName + "group does not exist.");
        return;
      } 
      console.log("=== Save Group Id 1 ===", res.data.group["id"].toString())
      localStorage.setItem(SELECTED_GROUP_ID, res.data.group["id"].toString() )
      setGroup(res.data.group);
      if (res.data.group != null) {
        getGroupHistoryAnon(res.data.group.id, lastChatDate);
      }      
    } catch (error) {
      // Handle error appropriately
    }
    dispatch(setIsLoading(false));
  }, [dispatch]);

  const getCurrentUserId = (): number => {
    let userId: string | null = "0";
    if (typeof window !== "undefined") {
      userId = localStorage.getItem(USER_ID_KEY);
      if (userId == null) {
        userId = "0";
      }
    }
    return parseInt(userId);
  };

  const getChatGroupID = (): number => {
    let groupID: string | null = "0";
    if (typeof window !== "undefined") {
      groupID = localStorage.getItem(SELECTED_GROUP_ID);
      if (groupID == null) {
        groupID = "0";
      }
    }    
    return parseInt(groupID);
  };

  const startCooldown = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (group?.slow_mode) {
      setCanSend(false);
      setCooldown(group.slow_time ?? 0);

      timerRef.current = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setCanSend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  function mergeArrays(oldArray: MessageUnit[], newArray: MessageUnit[]): MessageUnit[] {
    const oldMap = new Map(oldArray.map(item => [item?.Id, item]));
    for (const newItem of newArray) {
      oldMap.set(newItem?.Id, newItem); // updates existing or adds new
    }
    return Array.from(oldMap.values());
  }
  
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (localStorage.getItem(TOKEN_KEY) && token) {
      fetchSoundOption();
    }    
  }, [currentUserId]);

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

  useEffect(() => {
    if (filteredPrevMsgList.length < filteredMsgList.length) {
      scrollToBottom();
    }
  }, [filteredMsgList]);

  // The action for the last chat date
  useEffect(() => {
    if (lastChatDate == 1) return;
    const token = localStorage.getItem(TOKEN_KEY);
    getGroupHistory(token, group?.id, lastChatDate);
  }, [lastChatDate])

  // The action for the message send action
  const sendGroupMsgHandler = (type: string, value: string) => {
    if (isBannedUser) {
      toast.error("You can't send message now. You are banned.");
      setInputMsg("");
      return;
    }
    if (!canPost) {
      toast.error("You can't send message now. You have no permission.");
      setInputMsg("");
      return;
    }
    if (hideChat) return
    if (!canSend) {
      toast.error("You can't send message now. You can send " + cooldown + " seconds later.");
      return;
    }
    const memInfo = group?.members?.find(user => user.id == getCurrentUserId());
    const toTime = isTimedout(memInfo?.to_time ?? "")
    if (toTime != "" && group?.creater_id != getCurrentUserId()) {
      toast.error("You can't send message now. You are timed out. You can send message " + toTime + " later.");
      return
    }
    let receiverid = null
    if (filterMode == 2) {
      receiverid = 1
    } else if (filterMode == 1) {
      if (filteredUser?.id) {
        receiverid = filteredUser.id
      }
    }

    let token = localStorage.getItem(TOKEN_KEY)
    if (stayAsAnon) {
      token = "anon" + currentUserId.toString()
    }

    if (attachment?.type && attachment.type === 'file') {
      sendGroupMsg(group?.id, `<a className="inline-block text-cyan-300 hover:underline w-8/12 relative rounded-e-md" 
      href=${SERVER_URL + ""}/uploads/chats/files/${attachment.url}>File Name : ${attachment.url}</a>`
        , token, receiverid, replyMsg?.Id)
    } else if (attachment?.type && attachment.type === 'image') {
      sendGroupMsg(
        group?.id, 
        `<img src='${SERVER_URL}/uploads/chats/images/${attachment?.url}' alt="" />`, 
        token, 
        receiverid,
        replyMsg?.Id
      )
    } else {
       if (type === "gif") {
        sendGroupMsg(group?.id, value, token, receiverid, replyMsg?.Id);
      } else if (type === "sticker") {
        sendGroupMsg(group?.id, value, token, receiverid, replyMsg?.Id);
      } else {
        if (inputMsg.length > 0) {
          const myMemInfo = group?.members?.find(mem => mem.id == getCurrentUserId())

          if (group?.url_level == 1 
            && (myMemInfo?.role_id == 0 || myMemInfo?.role_id == null) 
            && containsURL(inputMsg)) {
            toast.error("You can't post url. You have no permission.");
            setInputMsg(""); 
            setShowEmoji(false);  
            return
          }
          const censorWords = getCensoredWordArray(group?.censored_words ?? null)
          const censoredMessage = getCensoredMessage(inputMsg, censorWords ?? [])
          sendGroupMsg(group?.id, censoredMessage, token, receiverid, replyMsg?.Id);       
          setInputMsg(""); 
          setShowEmoji(false);         
        }
      }      
    }
    setReplyMsg(null);
    setShowMsgReplyView(false);
    setAttachment({ type: null, url: null })
    let myMemInfo = group?.members?.find(mem => mem.id == getCurrentUserId())
    if (myMemInfo?.role_id == null || myMemInfo.role_id == 0) {
      if (group?.slow_mode && (group?.slow_time != null && group?.slow_time > 0)) {
        startCooldown();
      }
    }
  } 
  
  // To handle Image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files![0]
      const maxSize = 1024 * 1024 * 3; //available to upload maximum 3 MB of image

      if (file && file.size > maxSize) {
        toast.error(messages.common.exceededFileSize)
      } else {
        const formData = new FormData()
        formData.append("Image", file)
        const res = await axios.post(`${SERVER_URL}/api/private/add/chats/images`, formData, {
          headers:
          {
            "Accept": "application/json",
            'Content-Type': 'multipart/form-data',
            'Authorization': localStorage.getItem(TOKEN_KEY) || "",
          }
        })
        setAttachment(Object.assign({}, { type: "image", url: res.data }))
      }
    } catch (error) {

    }
  }

  // To handle File upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files![0]
      const maxSize = 1024 * 1024 * 5; //available to upload maximum 3 MB of image

      if (file && file.size > maxSize) {
        toast.error(messages.common.exceededFileSize)
      } else {
        const formData = new FormData()
        formData.append("File", file)
        const res = await axios.post(`${SERVER_URL}/api/private/add/chats/files`, formData, {
          headers:
          {
            "Accept": "application/json",
            'Content-Type': 'multipart/form-data',
            'Authorization': localStorage.getItem(TOKEN_KEY) || "",
          }
        })
        setAttachment(Object.assign({}, { type: "file", url: res.data }))
      }
    } catch (error) {

    }
  }

  // The action for the Attachment remove
  const handleRemoveAttachment = async () => {
    try {
      const res = await axios.post(`${SERVER_URL}/api/private/delete/chats/${attachment?.type === 'file' ? "files" : "images"}/${attachment?.url}`, {}, {
        headers:
        {
          "Accept": "application/json",
          'Content-Type': 'multipart/form-data',
          'Authorization': localStorage.getItem(TOKEN_KEY) || "",
        }
      })
      setAttachment(Object.assign({}, { type: null, url: null }))
    } catch (error) { }
  }

  const userBanButtonClicked = (userId: number | null | undefined) => {
    setOpenBanUserConfirmPopup(true);
    if (userId == undefined || userId == null) {
      return;
    }
    setBanUserId(userId);
  }

  const messageDeleteButtonClicked = (msgId: number | null | undefined) => {
    setOpenMsgDeleteConfirmPopup(true);
    if (msgId == undefined || msgId == null) {
      return;
    }
    setDeleteMsgId(msgId);
  }

  const getCurrentGroupOnlineUsers = () => {
    console.log("==== GET ONLINE USERS ====")
    const token = localStorage.getItem(TOKEN_KEY)
    getGroupOnlineUsers(token, group?.id)
  }

  const banUser = () => {
    if (banUserId == null) return;
    const token = localStorage.getItem(TOKEN_KEY)
    banGroupUser(token, group?.id, banUserId);
    setOpenBanUserConfirmPopup(false);
    setBanUserId(null);
  }

  const unbanUser = () => {
    const token = localStorage.getItem(TOKEN_KEY)
    unbanGroupUser(token, group?.id, getCurrentUserId());
    setOpenUnbanReqConfirmPopup(false);
  }

  const deleteMessage = () => {  
    console.log("aaaa");  
    if (deleteMsgId == null) return;
    const token = localStorage.getItem(TOKEN_KEY)
    deleteGroupMsg(token, deleteMsgId, group?.id);
    setOpenMsgDeleteConfirmPopup(false);
    setDeleteMsgId(null);
  }

  const onSendGroupNotification = (msg: string) => {
    const token = localStorage.getItem(TOKEN_KEY)
    hasShownGroupNotify.current = false
    sendGroupNotify(token, group?.id ?? null, msg)
  }

  const getMyBlockedUsers = () => {
    const token = localStorage.getItem(TOKEN_KEY)
    getBlockedUsers(token);
    dispatch(setIsLoading(true));
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.keyCode === 27) setShowEmoji(false)
      // else if (event.keyCode === 13) sendGroupMsgHandler()
    }
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  });

  const unbanRequestClicked = (groupId: number, userId: number, unban_request: number | null) => {
    if (unban_request == 1) {
      toast.success("You already sent unban request.");
      return;
    }
    setOpenUnbanReqConfirmPopup(true);
  }

  const handleGroupMenuClick = async (menuId: number) => {
    groupMemuPopoverRef.current?.click();
    if (menuId == 1) {
      try {
        fallbackCopyTextToClipboard(window.location.href)
        // await navigator.clipboard.writeText(window.location.href);
        toast.success("URL copied to clipboard!");
      } catch (err) {
        toast.error("Failed to copy URL: " + err);
      }
    } else if (menuId == 2) {
      let groupIdFav = favGroups?.find(grp => grp.id == group?.id) != null;
      let updateIsMember = groupIdFav ? 0 : 1;
      updateGroupFavInfo(localStorage.getItem(TOKEN_KEY), group?.id, updateIsMember);
    } else if (menuId == 3) {
      setHideChat(!hideChat)
    } else if (menuId == 4) {
      setOpenSendGroupNotification(true)
    } else if (menuId == 5) {
      setOpenEditGroupPop(true)
    } else if (menuId == 6) {
      localStorage.setItem(USER_ID_KEY, "")
      setCurrentUserId(-1)
      dispatch(setIsLoading(true))
      setStayAsAnon(false)
      userLoggedOut()
      localStorage.removeItem(TOKEN_KEY)
      dispatch(setIsLoading(false))
    } else if (menuId == 7) {
      setShowSigninPopup(true)
    }
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
      return  <div className='text-[14px] mt-[3px] text-gray-400'>{value}</div>;
    }
  }

  const getReplyMsgImgHtml = (content: string | null) => {
    if (content!.indexOf("<img") > -1) {
      let contentStr = content!.replace("<img", "<img style='height: 36px'")
      return <div
        className="inline-block w-fit h-[36px]"
        dangerouslySetInnerHTML={{ __html: contentStr! }}
      />;
    }
    if (content!.indexOf("gif::https://") > -1 ) {
      return <img src={content!.slice("gif::".length)} className="h-[36px]" /> 
    }

    if (content!.indexOf(".gif") > -1 && content!.indexOf("https://") > -1 && content!.indexOf(" ") < 0) {
      return <img src={content!} className="h-[36px]" />
    }
    
    if (content!.indexOf("sticker::") > -1 ) {
      return <Lottie animationData={getSticker(content!)} style={{height: 30 }} /> 
    }

    return null;
  }

  // Properly typed ref callback
  const setMsgItemRef = (index: number) => (el: HTMLDivElement | null) => {
    msgItemRefs.current[index] = el;
  };

  const scrollToRepliedMsg = (msgId: number | null | undefined) => {
    const itemIndex = filteredMsgList.findIndex(msg => msg.Id === msgId);
    console.log(itemIndex);
    const container = scrollContainerRef.current;
    const item = msgItemRefs.current[itemIndex];
    
    if (!container || !item) return;

    const containerHeight = container.clientHeight;
    const itemHeight = item.clientHeight;
    const itemOffsetTop = item.offsetTop;
    const scrollTop = itemOffsetTop - (containerHeight / 2) + (itemHeight / 2);
    container.scrollTo({
      top: scrollTop,
      behavior: 'smooth',
    });
  }

  useEffect(() => {
    if (mySoundOptionId == null || mySoundOptionId == undefined) {
      setSoundSelectedOption(null);
    } else {
      setSoundSelectedOption(soundSettingOptions.find(opt => opt.option_id == mySoundOptionId)?.val);
    }
    
  }, [mySoundOptionId]);

  const fetchSoundOption = useCallback(async () => {
    try {
      dispatch(setIsLoading(true));
      const res = await axios.post(`${SERVER_URL}/api/private/get/chats/option`, 
        {
          user_id: getCurrentUserId()
        }, 
        {
          headers: {
            "Accept": "application/json",
            "Content-type": "application/json",
            Authorization: localStorage.getItem(TOKEN_KEY),
          },
        });
      
      if (res == null) {
        setMySoundOptionId(null);
      } else {
        const optVal: ChatOption = res.data["option"][0];
        setMySoundOptionId(optVal.sound_option);
      }
    } catch (error) {
      
    }    
    dispatch(setIsLoading(false));
  }, [dispatch]);

  const updateSoundOption = async () => {
    try {
      dispatch(setIsLoading(true));
      soundMenuPopoverRef.current?.click();
      const optionVal = soundSettingOptions.find(opt => opt.val === soundSelectedOption)?.option_id;
      if (mySoundOptionId == optionVal) {
        dispatch(setIsLoading(false));
        return;
      }
      const res = await axios.post(`${SERVER_URL}/api/private/add/chats/updateoption`, 
        {
          user_id: getCurrentUserId(),
          sound_option: optionVal == null ? 0 : optionVal
        }, 
        {
          headers: {
            "Accept": "application/json",
            "Content-type": "application/json",
            Authorization: localStorage.getItem(TOKEN_KEY),
          },
        });
      setMySoundOptionId(optionVal);
    } catch (error) {
      
    }    
    dispatch(setIsLoading(false));
  }

  const handleSignin = (async (email: string, password: string) => {
    console.log("== LOG IN===")
    try {
        const res = await axios.post(`${SERVER_URL}/api/user/login`, {
          Email: email,
          Password: password,
          Role: 1,
        });

        // Error Notification
        if (res.status === httpCode.SUCCESS) {
          toast.success(messages.login.success);
          setCurrentUserId(res.data.id);
          localStorage.setItem(USER_ID_KEY, res.data.id);
          localStorage.setItem(TOKEN_KEY, res.data.token);
          console.log("=== Group Login===", group)
          loginAsReal(res.data.token, group?.id, getAnonId());
          setShowSigninPopup(false);
          console.log("== LOGIN USER===", res.data.id)
        } else if (res.status === httpCode.NOT_MATCHED) {
          toast.error(messages.common.notMatched);
        } else {
          toast.error(messages.common.failure);
        }

      } catch (error) {
        toast.error(messages.common.serverError);
      }   
    dispatch(setIsLoading(false));
  });

  const handleSignup = useCallback(async (email: string, name: string, password: string) => {
    try {
        const res = await axios.post(`${SERVER_URL}/api/user/register/group`, {
          Email: email,
          Name: name,
          Password: password
        });

        // Error Notification
        if (res.status === httpCode.SUCCESS) {
          toast.success(messages.login.success);
          setCurrentUserId(res.data.id);
          console.log("== LOGIN USER DATA===", res.data)
          localStorage.setItem(USER_ID_KEY, res.data.id);
          localStorage.setItem(TOKEN_KEY, res.data.token);
          loginAsReal(res.data.token, group?.id, getAnonId());
          setShowSigninPopup(false);
          setShowSignupPopup(false)
          console.log("== LOGIN USER===", res.data.id)
        } else if (res.status === httpCode.NOT_MATCHED) {
          toast.error(messages.common.notMatched);
        } else {
          toast.error(messages.common.failure);
        }

      } catch (error) {
        toast.error(messages.common.serverError);
      }   
    dispatch(setIsLoading(false));
  }, [dispatch]);
  

  // Admin and Mods tools Actions
  const handleAdminOptionClick = (optionId: string) => {
    if (optionId == "1") {
      setOpenChatLimitationPopup(true);
    } else if (optionId == "2") {
      setOpenManageChatPopup(true);
    } else if (optionId == "3") {
      setOpenModeratorsWidget(true);
    } else if (optionId == "4") {
      setOpenCensoredPopup(true);
    } else if (optionId == "5") {
      setOpenBannedUsersWidget(true);
    }
  }

  const updateChatLimits = (
    settings: any
  ) => {
    const token = localStorage.getItem(TOKEN_KEY)
    updateGroupChatLimitations(
      token, 
      group?.id, 
      settings.postOption, 
      settings.urlOption, 
      settings.slowMode,
      settings.speed
    )
    setOpenChatLimitationPopup(false)
    dispatch(setIsLoading(true));
  }

  const onSaveGroupConfig = () => {
    const token = localStorage.getItem(TOKEN_KEY)
    updateGroupChatboxConfig(
      token,
      group?.id ?? null,
      groupEditConfig.sizeMode,
      groupEditConfig.width,
      groupEditConfig.height,
      groupEditConfig.colors.background,
      groupEditConfig.colors.title,
      groupEditConfig.colors.msgBg,
      groupEditConfig.colors.msgText,
      groupEditConfig.colors.replyText,
      groupEditConfig.colors.dateText,
      groupEditConfig.colors.inputBg,
      groupEditConfig.settings.userImages,
      groupEditConfig.settings.customFontSize,
      groupEditConfig.settings.fontSize,
      groupEditConfig.settings.roundCorners,
      groupEditConfig.settings.cornerRadius
    )
    setOpenEditGroupPop(false)
    dispatch(setIsLoading(true));
  }

  const pinMessage = (msgId: number | null) => {
    const token = localStorage.getItem(TOKEN_KEY)
    pinChatmessage(token, group?.id, msgId);
  }

  const unpinMessage = (msgId: number | null) => {
    const token = localStorage.getItem(TOKEN_KEY)
    unpinChatmessage(token, group?.id, msgId);
  }

  const clearGroupChatMessages = () => {
    const token = localStorage.getItem(TOKEN_KEY)
    clearGroupChat(token, group?.id);
    setOpenManageChatPopup(false);
    dispatch(setIsLoading(true));
  }

  const onBlockUser = (userId: number | null) => {
    const token = localStorage.getItem(TOKEN_KEY)   
    blockUser(token, userId);
    dispatch(setIsLoading(true));
  }

  const updateModerators = (modIds: number[]) => {
    const token = localStorage.getItem(TOKEN_KEY)
    updateGroupModerators(token, group?.id, modIds);
    setOpenModeratorsWidget(false);
    dispatch(setIsLoading(true));
  }

  const updateModeratorPermissions = (modId: number | null, settings: any) => {
    const token = localStorage.getItem(TOKEN_KEY)
    updateGroupModPermissions(token, group?.id, modId, settings)
    dispatch(setIsLoading(true));
  }

  const onTimeOutGroupUser = (userId: number | null) => {
    const token = localStorage.getItem(TOKEN_KEY)
    timeoutGroupUser(token, group?.id, userId)
    dispatch(setIsLoading(true));
  }

  const updateCensoredContents = (contents: string | null) => {
    const token = localStorage.getItem(TOKEN_KEY)
    updateCensoredWords(token, group?.id, contents);
    setOpenCensoredPopup(false);
    dispatch(setIsLoading(true));
  }

  const unbanUsers = (userIds: number[]) => {
    const token = localStorage.getItem(TOKEN_KEY)
    unbanGroupUsers(token, group?.id, userIds);
    setOpenBannedUsersWidget(false);
    dispatch(setIsLoading(true));
  }

  useEffect(() => {
    if (currentUserId > 0 && currentUserId < 100000) {
      setShowSigninView(false)
    } else {
      if (stayAsAnon) {
        setShowSigninView(false)
      } else {
        setShowSigninView(true)
      }
    }
  }, [currentUserId, stayAsAnon])

  useEffect(() => {
    setShowOnlineUserCount(currentUserId > 0 && currentUserId < 100000 && !stayAsAnon)
  }, [currentUserId, stayAsAnon])

  const fallbackCopyTextToClipboard = (text:string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // Make textarea invisible but still selectable
    textArea.style.position = "fixed";
    textArea.style.top = "-999px";
    document.body.appendChild(textArea);

    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand("copy");
      console.log(successful ? "Copied!" : "Copy failed");
    } catch (err) {
      console.error("Fallback copy failed", err);
    }

    document.body.removeChild(textArea);
  }

  return (
    <div className="page-container bg-white">      
      {/* Chats Area Start */}
      {/* <ChatangoWidget /> */}
      {/* <iframe src="http://mg.pingbash.com" width="800" height="600" allow="clipboard-write"></iframe> */}
      <div className="content-wrapper w-full max-lg:px-0 h-screen overflow-y-auto overflow-x-hidden">
        {/* <div className="page-content w-full pt-[36px] h-full flex items-center justify-center px-[24px] pb-[24px] relative max-lg:px-[20px] "> */}
        <div className="page-content h-full flex items-center justify-center relative ">
          {/* <PageHeader /> */}
          <div className={`flex justify-center gap-[20px] w-full relative`}
            style={{
              width: groupConfig.sizeMode == "fixed" ? groupConfig.width : "100%",
              height: groupConfig.sizeMode == "fixed" ? groupConfig.height : "100%",
              maxWidth: "100%",
              maxHeight: "100%"
            }}
          >
            {/* Chat Left Side Start ---Chat Hisotry */}
            
            {/* Chat Left Side End ---Chat History */}

            {/* Chat Right Side Start ---Message History */}
            <section className={`flex flex-col justify-between bg-white border border-gray-500 rounded-[10px] duration-500 w-full`}
              style={{
                borderRadius: groupConfig.settings.roundCorners ? groupConfig.settings.cornerRadius ?? CORNOR_RADIUS : CORNOR_RADIUS,                
              }}
            >

              {/* Chat Right Side Header Start */}
              {group?.id != 0 && 
              <nav className="shadow-lg shadow-slate-300 select-none px-[20px] py-[16px] gap-[10px] border-b flex justify-between flex-wrap"
                style={{background: groupConfig.colors.background ?? BG_COLOR, 
                  borderTopLeftRadius: groupConfig.settings.roundCorners ? groupConfig.settings.cornerRadius ?? CORNOR_RADIUS : CORNOR_RADIUS,
                  borderTopRightRadius: groupConfig.settings.roundCorners ? groupConfig.settings.cornerRadius ?? CORNOR_RADIUS : CORNOR_RADIUS,
                  color: group?.title_color ?? TITLE_COLOR, zIndex: 1
                }}
              >
                <div className="flex gap-[16px] items-center">  
                  <div>
                    <div className="flex justify-start max-[810px]:flex-col items-center gap-[5px] whitespace-nowrap truncate">
                      <div className="text-[20px] font-bold truncate w-[100%]">{group?.name}</div>
                  </div>
                  </div>
                </div>
                <div className="flex items-center flex-row">
                  {!showSigninView && <Popover placement="bottom-start" showArrow >
                    <PopoverTrigger>
                      <div className="max-[810px]:flex cursor-pointer" ref={groupMemuPopoverRef}><FontAwesomeIcon icon={faBars} className="text-[22px]" /></div>
                    </PopoverTrigger>
                    <PopoverContent className="bg-white dark:bg-zinc-100 border rounded-md shadow-md w-64 p-[16px]">
                      <ul className="flex flex-col gap-2">
                        {groupMenuOptions.map((item, index) => (
                          <li
                            key={index}
                            className="px-3 py-1 rounded-md hover:bg-default-200 cursor-pointer"
                            onClick={() => handleGroupMenuClick(item.id)}
                          >
                            {item.name}
                          </li>
                        ))}
                        <SwitchButton enabled={isDarkMode} onToggle={setDarkMode} />
                      </ul>
                    </PopoverContent>
                  </Popover>}
                  {/* {currentUserId > 0 && <div className="ml-[12px] cursor-pointer" onClick={() => {
                    localStorage.clear()
                    setCurrentUserId(0)
                  }}>LOG OUT</div>} */}
                </div>
                
              </nav>}
              {/* Chat Right Side Header End */}

              {/* Pinned Message carousel Start */}
              {!hideChat && pinnedMessages?.length > 0 && 
              <PinnedMessagesWidget
                messages={pinnedMessages}
                bgColor={groupConfig.colors.background}
                titleColor={groupConfig.colors.title}
                msgColor={groupConfig.colors.msgText}
                fontSize={groupConfig.settings.fontSize}
                onMessageClick={(id) => {
                  // Replace this with scroll-to-message logic
                  scrollToRepliedMsg(id);
                  setTabbedPinMsgId(id);
                }}
              />}
              
              {/* Pinned Message Carousel End */}

              {/* Chat Article Start */}
              <article className={`overflow-y-auto h-full ${hideChat ? "hidden" : "flex"} flex-col px-[14px] pt-[20px] overflow-x-hidden min-h-20`}
                style={{background: groupConfig.colors.msgBg ?? MSG_BG_COLOR}}
              >
                {/* <div className="text-center text-sm"><button onClick={() => setLastChatDate(lastChatDate + 1)}
                  style={{color: groupConfig.colors.msgText ?? MSG_COLOR}}  
                >Read More</button></div> */}
                <div className="flex flex-col gap-[4px] overflow-y-scroll" ref={scrollContainerRef} >
                  {filteredMsgList?.length ? filteredMsgList.map((message, idx) => {
                    if (message.group_id === group?.id) {
                      return (
                        <div key={idx} ref={setMsgItemRef(idx)}>
                          <Message
                            key={`message-${idx}`}
                            avatar={message?.sender_avatar ? `${SERVER_URL}/uploads/users/${message.sender_avatar}` : null}
                            content={`${message.Content}`}
                            sender_banned={message.sender_banned}
                            time={chatDate(`${message.Send_Time}`)}
                            read_time={message.Read_Time}
                            parentMsg={filteredMsgList.find(msg => msg.Id === message.parent_id)}
                            showPin={canPinMessage}
                            isPinned={pinnedMsgIds.includes(message.Id ?? -1)}
                            isTabbed={tabbedPinMsgId == message.Id}
                            show_reply={true}

                            show_avatar={groupConfig.settings.userImages ?? SHOW_USER_IMG}
                            font_size={groupConfig.settings.customFontSize ? groupConfig.settings.fontSize ?? FONT_SIZE : FONT_SIZE}
                            message_color={groupConfig.colors.msgText ?? MSG_COLOR}
                            date_color={groupConfig.colors.dateText ?? MSG_DATE_COLOR}
                            reply_message_color={groupConfig.colors.replyText ?? REPLY_MGS_COLOR}

                            message={message}
                            group={group}
                            userId={currentUserId}

                            onDelete={messageDeleteButtonClicked}
                            onBanUser={userBanButtonClicked}
                            onReplyMessage={(msgId) => {
                              if (isBannedUser) return
                              if (!canPost) return
                              if (hideChat) return
                              if (!canSend) {
                                toast.error("You can't send message now. You can send " + cooldown + " seconds later.");
                                return;
                              }
                              const memInfo = group?.members?.find(user => user.id == getCurrentUserId());
                              const toTime = isTimedout(memInfo?.to_time ?? "")
                              if (toTime != "" && group?.creater_id != getCurrentUserId()) {
                                toast.error("You can't send message now. You are timed out. You can send message " + toTime + " later.");
                                return
                              }
                              setReplyMsg(filteredMsgList.find(msg => msg.Id === msgId));
                              setShowMsgReplyView(true);
                            }}
                            onReplyMsgPartClicked={(msgId) => {
                              scrollToRepliedMsg(msgId);
                            }}
                            onEndedHighlight={() => setTabbedPinMsgId(null)}                            
                            onPinMessage={(msgId) => {
                              if (!canPinMessage) return
                              pinnedMsgIds.includes(message.Id ?? -1) ? unpinMessage(msgId) : pinMessage(msgId)
                            }}
                            onTimeOutUser={onTimeOutGroupUser} 
                            onBlockUser={onBlockUser}   
                          />
                        </div>
                        
                      );
                    }
                    return null;
                  }) : ""}</div>
              </article>
              {/* Chat Article End */}
              <nav className={`relative max-[320px]:px-[5px] gap-[10px] flex flex-col border-t ${isMobile ? "p-[8px]" : "px-[12px] py-[6px]"}`}
                style={{background: groupConfig.colors.background ?? BG_COLOR, 
                  borderBottomLeftRadius: groupConfig.settings.roundCorners ? groupConfig.settings.cornerRadius ?? CORNOR_RADIUS : CORNOR_RADIUS,
                  borderBottomRightRadius: groupConfig.settings.roundCorners ? groupConfig.settings.cornerRadius ?? CORNOR_RADIUS : CORNOR_RADIUS,
                  color: groupConfig.colors.title ?? TITLE_COLOR
                }}
              >
                {/* start upload preview for image or file */}
                {attachment?.type && <div className="upload-preview relative">
                  {attachment.type === 'image' && <Image className="h-[100px] w-auto" src={`${SERVER_URL}/uploads/chats/images/${attachment.url}`} alt="" width={100} height={100} />}
                  {attachment.type === 'file' && (<div>File : ${attachment.url}</div>)}
                  <div onClick={handleRemoveAttachment} className="absolute top-0 right-0 text-xl cursor-pointer inline-block w-2 h-2">&times;</div>
                </div>}
                {/* end upload preview for image or file */}

                {showMsgReplyView && replyMsg && <div className="none relative flex flex-row justity-start h-[36px]">
                  <div><FontAwesomeIcon icon={faReply} className="text-[20px] mt-[4px] mr-[12px] text-[#2596be]"/></div>
                  {getReplyMsgImgHtml(replyMsg.Content)}
                  <div className="h-[16px] flex items-center  whitespace-nowrap absolute top-0 right-0 gap-2 mr-[12px]">
                    <button onClick={() => {
                      setReplyMsg(null);
                      setShowMsgReplyView(false);
                    }}>
                      <FontAwesomeIcon icon={faClose} className="text-[16px] text-[#8A8A8A]"/>
                    </button>
                  </div>   
                  <div className="ml-[12px] flex-column">
                    <div className="font-bold text-[15px] text-[#2596be] h-[16px] text-ruby">Reply to {replyMsg?.sender_name}</div> 
                    {getReplyMsgContentHtml(replyMsg.Content)} 
                  </div>                   
                </div>}
                    
                <div className="flex max-sm:flex-col-reverse justify-between gap-[10px] items-center">                  
                  <div className="max-[810px]:flex justify-between max-[810px]:w-full">                    
                    <div className="flex gap-[10px] min-w-[126px] relative cursor-pointer max-[810px]:flex">
                      <div 
                        onClick={() => {
                          if (isBannedUser) return
                          if (!canPost) return
                          if (hideChat) return
                          if (!canSend) {
                            toast.error("You can't send message now. You can send " + cooldown + " seconds later.");
                            return;
                          }
                          const memInfo = group?.members?.find(user => user.id == getCurrentUserId());
                          const toTime = isTimedout(memInfo?.to_time ?? "")
                          if (toTime != "" && group?.creater_id != getCurrentUserId()) {
                            toast.error("You can't send message now. You are timed out. You can send message " + toTime + " later.");
                            return
                          }
                          imageUploadRef.current?.click()
                        }} 
                        className="w-[24px] h-[24px]"><FontAwesomeIcon icon={faImages} className="text-[24px]" />
                      </div>
                      <input ref={imageUploadRef} type="file" onChange={handleImageUpload} className="hidden" accept="image/*" />
                      <div 
                        onClick={() => {
                          if (isBannedUser) return
                          if (!canPost) return
                          if (hideChat) return
                          if (!canSend) {
                            toast.error("You can't send message now. You can send " + cooldown + " seconds later.");
                            return;
                          }
                          const memInfo = group?.members?.find(user => user.id == getCurrentUserId());
                          const toTime = isTimedout(memInfo?.to_time ?? "")
                          if (toTime != "" && group?.creater_id != getCurrentUserId()) {
                            toast.error("You can't send message now. You are timed out. You can send message " + toTime + " later.");
                            return
                          }
                          fileUploadRef.current?.click()
                        }} 
                        className="w-[24px] h-[24px]"><FontAwesomeIcon icon={faPaperclip} className="text-[24px]" />
                      </div>
                      <input ref={fileUploadRef} type="file" onChange={handleFileUpload} className="hidden" />
                      {showEmoji &&
                      <div className=" absolute bottom-[3em] max-[810px]:bottom-[5.5em] w-[370px] h-[415px]">                      
                        <EmojiPicker
                          onSelect={(value) => {
                            console.log("Selected:", value)
                            // Example:
                            if (value.type === 'emoji') { setInputMsg(inputMsg + value.content); inputMsgRef.current?.focus() }
                            if (value.type === 'gif') {
                              sendGroupMsgHandler("gif", "gif::"+value.content);
                              setInputMsg("");
                              setShowEmoji(false);
                            }
                            if (value.type === 'sticker') {
                              sendGroupMsgHandler("sticker", "sticker::"+value.content);
                              setInputMsg("");
                              setShowEmoji(false);
                            }
                          }}
                        />
                      </div>}
                      <div 
                        onClick={() => {
                          if (isBannedUser) return
                          if (!canPost) return
                          if (hideChat) return
                          if (!canSend) {
                            toast.error("You can't send message now. You can send " + cooldown + " seconds later.");
                            return;
                          }
                          const memInfo = group?.members?.find(user => user.id == getCurrentUserId());
                          const toTime = isTimedout(memInfo?.to_time ?? "")
                          if (toTime != "" && group?.creater_id != getCurrentUserId()) {
                            toast.error("You can't send message now. You are timed out. You can send message " + toTime + " later.");
                            return
                          }
                          setShowEmoji(!showEmoji)
                        }} 
                        className="w-[24px] h-[24px]"><FontAwesomeIcon icon={faFaceSmile} className="text-[24px]" />
                      </div>
                      <Popover placement="bottom-start" showArrow >
                        <PopoverTrigger>
                          <div className="w-[24px] h-[24px]" ref={soundMenuPopoverRef}><FontAwesomeIcon icon={faVolumeUp} className="text-[24px]" /></div>
                          
                        </PopoverTrigger>
                        <PopoverContent className="relative bg-white dark:bg-zinc-100 border rounded-md shadow-md p-4 w-72">
                          <button
                            onClick={() => {
                              soundMenuPopoverRef.current?.click();
                              setSoundSelectedOption(soundSettingOptions.find(opt => opt.option_id == mySoundOptionId)?.val);
                            }}
                            className="absolute top-2 right-2 text-gray-500 hover:text-black text-[24px]"
                            aria-label="Close"
                          >
                            ×
                          </button>
                          <h3 className="text-lg font-medium mb-2">Play sounds:</h3>
                          <ul className="flex flex-col gap-2">
                            {soundSettingOptions.map((item, index) => (
                              <div className="flex items-center mb-2" key={index}>
                                <input
                                  type="radio"
                                  id={item.val}
                                  // name="sound"
                                  value={item.val}
                                  checked={soundSelectedOption === soundSettingOptions[index].val}
                                  onChange={(e) => {
                                    setSoundSelectedOption(e.target.value)
                                  }}
                                  className="mr-2"
                                />
                                <label htmlFor={item.val}>{item.name}</label>
                              </div>
                            ))}
                          </ul>
                          <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              updateSoundOption();
                            }}
                            className="bg-gray-300 hover:bg-gray-400 text-black py-1 px-4 rounded"
                          >
                            OK
                          </button>
                        </div>
                        </PopoverContent>
                      </Popover>                    
                    </div>
                    <div className={`hidden gap-[10px] ${adminManageOptions?.length > 0 && !isBannedUser ? "min-w-[152px]" : "min-w-[72px]"} relative cursor-pointer max-[810px]:flex`}>                      
                      {showOnlineUserCount && <div className="w-[40px] h-[24px]" onClick={() => setOpenGroupOnlineUsersPopup(true)}><FontAwesomeIcon icon={faUser} className="text-[24px] mr-[8px]" />{groupOnlineUserIds.length}</div>}
                      <Popover placement="bottom-start" showArrow >
                        <PopoverTrigger>
                          <span className="w-[24px] h-[24px]" ref={filterPopoverRef}><FontAwesomeIcon icon={faFilter} className="text-[24px]" /></span>
                          
                        </PopoverTrigger>
                        <PopoverContent className="relative bg-white dark:bg-zinc-100 border rounded-md shadow-md p-4 ">
                          <ul className="flex flex-col gap-2 w-[240px]">
                            {filterOptions &&                           
                            <FilterWidget
                              currentMode={filterMode}
                              filteredUser={filteredUser}
                              filterOptions={filterOptions}
                              users={group?.members ?? []}
                              onFilterModeUpdatede={(id) => {
                                setFilteredUser(null)
                                setFilterMode(id)
                              }}
                              onUserSelected={(user) => {
                                setFilteredUser(user)
                                console.log('Selected User:', user)
                              }}
                            />}
                          </ul>
                        </PopoverContent>
                      </Popover>  
                      
                      {adminManageOptions?.length > 0 && !isBannedUser && 
                      <Popover placement="bottom-start" showArrow >
                        <PopoverTrigger>
                          <div className="w-[24px] h-[24px]" ref={adminManagePopoverRef}><FontAwesomeIcon icon={faSliders} className="text-[24px]" /></div>
                        </PopoverTrigger>
                        <PopoverContent className="relative bg-white dark:bg-zinc-100 border rounded-md shadow-md p-4 w-60">
                          <ul className="flex flex-col gap-2">
                            {adminManageOptions.map((item, index) => (
                              <div 
                                className="flex items-center mb-2 cursor-pointer" 
                                key={index} 
                                onClick={() => {
                                  handleAdminOptionClick(item.id);
                                  adminManagePopoverRef.current?.click()
                                }}
                              >
                                <label htmlFor={item.id} className="text-[18px] cursor-pointer">{item.name}</label>
                              </div>
                            ))}
                          </ul>
                        </PopoverContent>
                      </Popover>}                                           
                    </div>
                  </div>
                  
                  <div className={`flex w-full items-center justify-between p-[6px] ${isMobile ? "pl-12px" : "pl-[16px]"} rounded-full border`}
                    style={{background: groupConfig.colors.inputBg ?? INPUT_BG_COLOR}}
                  >
                    <input 
                      type="text" 
                      ref={inputMsgRef} 
                      onKeyDown={(e) => e.keyCode === 13 && sendGroupMsgHandler("msg", "")} 
                      value={inputMsg} 
                      onChange={(e) => setInputMsg(e.target.value)} 
                      className="w-full outline-none text-[14px] leading-[24px]" 
                      placeholder="Write a message" 
                       style={{background: groupConfig.colors.inputBg ?? INPUT_BG_COLOR, color: groupConfig.colors.msgText ?? MSG_COLOR}}
                      />
                    <button onClick={() => sendGroupMsgHandler("msg", "")} className="h-[30px] active:translate-y-[2px] py-[3px] max-[320px]:px-[12px] px-[26px] rounded-full text-[14px] max-[320px]:text-[10px] text-white bg-gradient-to-r from-[#BD00FF] to-[#3A4EFF]">
                      {isMobile ? <div className="hidden max-[810px]:flex"><FontAwesomeIcon icon={faPaperPlane} className="text-[16px]" /></div> : "Send"}
                    </button>
                  </div>
                  <div className={`flex gap-[10px] ${adminManageOptions?.length > 0 && !isBannedUser ? "min-w-[122px]" : "min-w-[82px]"} relative cursor-pointer max-[810px]:hidden`}>                      
                    {showOnlineUserCount && <div className="w-auto h-[24px]" onClick={() => setOpenGroupOnlineUsersPopup(!openGroupOnlineUsersPopup)}><FontAwesomeIcon icon={faUser} className="text-[24px] pr-[6px]" />{groupOnlineUserIds.length}</div>}
                    <Popover placement="bottom-start" showArrow >
                      <PopoverTrigger>
                        <span className="w-[24px] h-[24px]" ref={filterPopoverRef}><FontAwesomeIcon icon={faFilter} className="text-[24px]" /></span>
                        
                      </PopoverTrigger>
                      <PopoverContent className="relative bg-white dark:bg-zinc-100 border rounded-md shadow-md p-4 ">
                        <ul className="flex flex-col gap-2 w-[240px]">
                          {filterOptions &&                           
                          <FilterWidget
                            currentMode={filterMode}
                            filteredUser={filteredUser}
                            filterOptions={filterOptions}
                            users={group?.members ?? []}
                            onFilterModeUpdatede={(id) => {
                              setFilteredUser(null)
                              setFilterMode(id)
                            }}
                            onUserSelected={(user) => {
                              setFilteredUser(user)
                              console.log('Selected User:', user)
                            }}
                          />}
                        </ul>
                      </PopoverContent>
                    </Popover>  
                    
                    {adminManageOptions?.length > 0 && !isBannedUser && 
                    <Popover placement="bottom-start" showArrow >
                      <PopoverTrigger>
                        <div className="w-[24px] h-[24px]" ref={adminManagePopoverRef}><FontAwesomeIcon icon={faSliders} className="text-[24px]" /></div>
                      </PopoverTrigger>
                      <PopoverContent className="relative bg-white dark:bg-zinc-100 border rounded-md shadow-md p-4 w-60">
                        <ul className="flex flex-col gap-2">
                          {adminManageOptions.map((item, index) => (
                            <div 
                              className="flex items-center mb-2 cursor-pointer" 
                              key={index} 
                              onClick={() => {
                                handleAdminOptionClick(item.id);
                                adminManagePopoverRef.current?.click()
                              }}
                            >
                              <label htmlFor={item.id} className="text-[18px] cursor-pointer">{item.name}</label>
                            </div>
                          ))}
                        </ul>
                      </PopoverContent>
                    </Popover>}                                           
                  </div>
                </div>
                {/* Image Upload, File Upload, Emoticon End */}

                {/* Add Sign in button for the anons */}
                {showSigninView && <div className="z-[11] w-full h-full absolute bottom-[0px] right-[0px] py-[3px] border-t px-[8px]" onClick={() => {setShowSigninPopup(true)}}>
                  <div 
                    className="h-full w-full bg-white flex justify-center items-center cursor-pointer"
                    style={{
                      background: groupConfig.colors.background ?? BG_COLOR,
                      borderBottomLeftRadius: groupConfig.settings.roundCorners ? groupConfig.settings.cornerRadius ?? CORNOR_RADIUS : CORNOR_RADIUS,
                      borderBottomRightRadius: groupConfig.settings.roundCorners ? groupConfig.settings.cornerRadius ?? CORNOR_RADIUS : CORNOR_RADIUS,
                      color: groupConfig.colors.title ?? TITLE_COLOR
                    }}
                  >
                        Sign in
                  </div>
                </div>}                
              </nav>
            </section>
            {/* Chat Right Side Start ---Message History */}
          </div>
        </div>
      </div>
      {/* Chats Area End */}
      <SigninPopup 
        isOpen={showSigninPopup} 
        onClose={() => setShowSigninPopup(false)} 
        onSignin={handleSignin}
        goToSignup={() => {
          setShowSigninPopup(false)
          setShowSignupPopup(true)
        }}
        goAsAnon={() => {
          setStayAsAnon(true)
          setShowSigninPopup(false)
          console.log("=== Anon Id ====", getAnonId())
          registerAsAnon(getAnonId());  
          setCurrentUserId(getAnonId())
        }}
      />
      <SignupPopup
        isOpen={showSignupPopup} 
        onClose={() => setShowSignupPopup(false)} 
        onSignup={handleSignup}
        goToSignin={() => {
          setShowSignupPopup(false)
          setShowSigninPopup(true)
        }}
      />
      <GroupCreatPopup isOpen={openEditGroupPop} onClose={() => setOpenEditGroupPop(false)}>
        <h2 className="text-xl font-semibold mb-2 flex justify-center">Group: {group?.name}</h2>
        <GroupPropsEditWidget
          groupName={group?.name ?? ""} 
          groupConfig={groupConfig}
          onUpdatedConfig={(conf) => {
            setGroupEditConfig(conf);
          }}
        />         
        <button  className={`h-[40px] mt-[20px] py-[2px] rounded-[12px] font-semibold text-white w-full bg-gradient-to-r from-[#BD00FF] to-[#3A4EFF] cursor-pointer `}
        onClick={() => onSaveGroupConfig()}>Save</button>
      </GroupCreatPopup>
      <SendNotificationPopup
        isOpen={openSendGroupNotification}
        onClose={() => setOpenSendGroupNotification(false)}
        onSend={onSendGroupNotification}
      />
      <ConfirmPopup
        title={"Delete message?"}
        description={"Are you sure you want to delete this message?"}
        yesBtnTitle="Yes, delete"
        noBtnTitle="Cancel"
        isOpen={openMsgDeleteConfirmPopup}
        onNoBtnclicked={() => {
          setOpenMsgDeleteConfirmPopup(false);
          setDeleteMsgId(null);
        }}
        onYesBtnClicked={deleteMessage}
      />
      <ConfirmPopup
        title={"Ban this user?"}
        description={"Are you sure you want to ban this user?"}
        yesBtnTitle="Yes, ban"
        noBtnTitle="Cancel"
        isOpen={openBanUserConfirmPopup}
        onNoBtnclicked={() => {
          setOpenBanUserConfirmPopup(false);
          setBanUserId(null);
        }}
        onYesBtnClicked={banUser}
      />
      <ConfirmPopup
        title={"Unban request send?"}
        description={"Are you sure you want to send unban request to owner?"}
        yesBtnTitle="Yes, ban"
        noBtnTitle="Cancel"
        isOpen={openUnbanReqConfirmPopup}
        onNoBtnclicked={() => {
          setOpenUnbanReqConfirmPopup(false);
          setBanUserId(null);
        }}
        onYesBtnClicked={unbanUser}
      />

      {/* Group Admin Modals */}
      <ChatLimitPopup
        isOpen={openChatLimitationPopup} 
        postLvl = {group?.post_level}
        urlLvl = {group?.url_level}
        slow_mode = {group?.slow_mode}
        slowTime = {group?.slow_time}
        onClose={() => {
          setOpenChatLimitationPopup(false)
        }} 
        onConfirm={updateChatLimits}
      />

      <ManageChatPopup 
        isOpen={openManageChatPopup}
        isOpenPinnedMsgView={showPinnedMessagesView}
        onClose={() => setOpenManageChatPopup(false)}
        onOpenPinnedMsgView={setShowPinnedMessageView}
        pinnedMessages={filteredMsgList.filter(msg => pinnedMsgIds.includes(msg?.Id ?? -1))}
        unPinGroupMessage={unpinMessage}
        onClearChat={clearGroupChatMessages}
      />

      <ModeratorsPopup
        allMembers={group?.members?.filter(mem => mem.role_id != 1 && mem.role_id != 2) ?? []}
        moderators={group?.members?.filter(mem => mem.role_id == 2) ?? []}
        isOpen={openModeratorsWidget}
        onClose={() => setOpenModeratorsWidget(false)}
        onSave={updateModerators}
        onUpdateModPermissions={updateModeratorPermissions}
      />
      
      <CensoredContentsPopup
        isOpen={openCensoredPopup}
        onClose={() => setOpenCensoredPopup(false)}
        contentsStr={group?.censored_words ?? ""}
        onSave={updateCensoredContents}
      />

      <BannedUsersPopup 
        users={groupBannedUsers}
        isOpen={openBannedUsersWidget}
        onClose={() => setOpenBannedUsersWidget(false)}
        unbanUsers={unbanUsers}
      />

      <GroupOnlineUsersPopup 
        isOpen={openGroupOnlineUsersPopup}
        onClose={() => setOpenGroupOnlineUsersPopup(false)}
        onlineUserIds={groupOnlineUserIds}
        allCount={groupOnlineUserIds.length}
        members={group?.members ?? []}
      />
    </div>
  );
};

const Chats: React.FC = () => {
  return (
    <Suspense fallback={<PreLoading />} >
      <ChatsContent />
    </Suspense >
  )
}
export default Chats;
