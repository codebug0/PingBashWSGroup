'use client'

import React, { Suspense, useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import EmojiPicker from "@/components/chats/EmojiPicker";
import Message from "@/components/chats/message";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faArrowLeft, 
  faArrowRight,
  faPaperPlane,
  faBars,
  faClose,
  faReply
} from "@fortawesome/free-solid-svg-icons";
import { 
  getHistory,
  getGroupHistory, 
  getGroupHistoryAnon,
  getMessages, 
  getUsers, 
  sendMsg, 
  sendGroupMsg, 
  getGroupMessages, 
  listenGroupMessages,
  socket, 
  readMsg, 
  readGroupMsg, 
  deleteGroupMsg,
  banGroupUser,
  unbanGroupUser,
  registerAsAnon,
  loginAsReal
 } from "@/resource/utils/chat";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Popover, PopoverTrigger, PopoverContent } from "@nextui-org/popover";
import ChatConst from "@/resource/const/chat_const";
import { SERVER_URL } from "@/resource/const/const";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { chatDate, now } from "@/resource/utils/helpers";
import { setChatUserList } from "@/redux/slices/messageSlice";
import { MessageUnit, User, ChatOption } from "@/interface/chatInterface";
import { setMessageList } from "@/redux/slices/messageSlice";
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


interface Attachment {
  type: string | null;
  url: string | null;
}

interface Group {
  id: number;
  name: string;
  creater_id: number;
  members: string[];
}

const ChatsContent: React.FC = () => {

  const [inputMsg, setInputMsg] = useState("")
  const [lastChatDate, setLastChatDate] = useState(1)
  const [showEmoji, setShowEmoji] = useState(false)
  const [attachment, setAttachment] = useState<Attachment>()

  const msgList: MessageUnit[] = useSelector((state: RootState) => state.msg.messageList)
  const userList = useSelector((state: RootState) => state.msg.chatUserList)
  const selectedUser = useSelector((state: RootState) => state.msg.selectedChatUser)
  const [prevMsgList, setPrevMsgList] = useState<MessageUnit[]>([]);

  const groupList = useSelector((state: RootState) => state.msg.chatGroupList)

  // const [groups, setGroups] = useState<Group[]>([]);

  const params = useSearchParams();
  const dispatch = useDispatch()
  const role = params.get("Role");
  const router = useRouter();
  const path = usePathname();
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
  const groupMemuPopoverRef = useRef<HTMLButtonElement>(null);
  const msgItemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [replyMsg, setReplyMsg] = useState<MessageUnit | null | undefined>();
  const [showMsgReplyView, setShowMsgReplyView] = useState<boolean | null>(null);
  const playBell = useSound("/sounds/sound_bell.wav");
  const [currentUserId, setCurrentUserId] = useState<number | null>(0);

  const groupMenuOptions = [
    {id: 1, name: "Copy Group Link"},
    {id: 2, name: "Add to My Groups"},
    {id: 3, name: "Hide Chat"},
    {id: 4, name: "Subscribe to Notifications"}
  ] 
  const soundMenuPopoverRef = useRef<HTMLImageElement>(null);
  const [anonUserToken, setAnonUserToken] = useState<string | null>(null);

  const [mySoundOptionId, setMySoundOptionId] = useState<number | null | undefined>(null);
  const [soundSelectedOption, setSoundSelectedOption] = useState<string | null | undefined>(null);
  const soundSettingOptions = [
    {val: "every", name: "On every message",  option_id: 1},
    {val: "reply", name: "Only on @replies",  option_id: 2},
    {val: "never", name: "Never",  option_id: 0}
  ];

  const [showSigninPopup, setShowSigninPopup] = useState<boolean>(false);

  const [userNavShow, setUserNavShow] = useState(params.get("User") ? false : true);
  const [selectedGroupId, setSelectedGroupid] = useState<number>(0);

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

  function getBrowserUUID() {
    let uuid = localStorage.getItem("browser_uuid");
    if (!uuid) {
      uuid = crypto.randomUUID(); // Use `uuidv4()` from 'uuid' lib if needed
      localStorage.setItem("browser_uuid", uuid);
    }
    return uuid;
  }

  function getAnonToken() {
    const groupName = getSubDomain();    
    const browserUUid = getBrowserUUID();
    const anontoken = "anonuser" + groupName + browserUUid;
    return anontoken
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
    registerAsAnon(getAnonId());
    // listenGroupMessages(getAnonToken(), getSubDomain());
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    // fetchSoundOption();
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    const handleLogginAsAnon = (data: any) => {
      console.log("==== Anon Registered ====", data);
      if (data.success == "success") {
        registerAnon(getAnonToken(), getAnonId(), getSubDomain());
      }
    };

    // Register socket listener
    socket.on(ChatConst.USER_LOGGED_AS_ANNON, handleLogginAsAnon);

    socket.on(ChatConst.GET_GROUP_HISTORY_ANON, (data) => {
      dispatch(setMessageList([...data]))
    })

    // Cleanup to avoid memory leaks and invalid state updates
    return () => {
      socket.off(ChatConst.USER_LOGGED_AS_ANNON, handleLogginAsAnon);
      socket.off(ChatConst.GET_GROUP_HISTORY_ANON, (data) => {
        dispatch(setMessageList([...data]))
      })
    };
  }, []);

  // To get the initial data for the users and the categegories for the dashboard
  const registerAnon = useCallback(async (token: string, anonId: number, groupName: string) => {
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
      if (res.data.group_id == 0) {
        dispatch(setIsLoading(false));
        toast.error(groupName + "group does not exist.");
        return;
      }
      setSelectedGroupid(res.data.group_id);      
      getGroupHistoryAnon(res.data.group_id, lastChatDate);
    } catch (error) {
      // Handle error appropriately
    }
    dispatch(setIsLoading(false));
  }, [dispatch]);

  const getCurrentUserId = (): number => {
    let userId: string | null = "0";
    if (typeof window !== "undefined") {
      userId = localStorage.getItem('MayaIQ_User');
      if (userId == null) {
        userId = "0";
      }
    }
    return parseInt(userId);
  };

  // Receive the message afer sending the message.
  socket.on(ChatConst.SEND_GROUP_MSG, (data) => {    
    const groupId = data?.length && data[data.length - 1].group_id;
    console.log("message arrived");    
    if (groupId === selectedGroupId) {
      setPrevMsgList(msgList);
      dispatch(setMessageList([...data]));
      const prevLength = msgList == null ? 0 : msgList.length;
      const newLength = data == null ? 0 : data.length;
      if (prevLength + 1 == newLength) {
        if (data[newLength - 1].Sender_Id != getCurrentUserId()) {
          
          if (mySoundOptionId == 1) {
            playBell();
          } else if (mySoundOptionId == 2) {
            if (data[newLength - 1].parent_id != null) {
              const toMsgId = data[newLength - 1].parent_id;
              const toMsg = msgList.find(msg =>  msg.Id == toMsgId);
              if (toMsg?.Sender_Id == getCurrentUserId()) {
                playBell();
              }
            }
          }          
        }
      }
    }
  });

  // Receive updated message afer delete group message.
  socket.on(ChatConst.DELETE_GROUP_MSG, (data) => { 
    const updateMsgList = msgList.filter(msg => msg.Id != data);
    setPrevMsgList(msgList);
    dispatch(setMessageList([...updateMsgList]))
  });

  socket.on(ChatConst.BAN_GROUP_USER, (data) => { 
    const groupId = data?.length && data[data.length - 1].group_id;    
    if (groupId === selectedGroupId) {
      setPrevMsgList(msgList);
      dispatch(setMessageList([...data]))
    }
  });

  socket.on(ChatConst.UNBAN_GROUP_USER, (data) => { 
    const groupId = data?.length && data[data.length - 1].group_id;    
    if (groupId === selectedGroupId) {
      setPrevMsgList(msgList);
      dispatch(setMessageList([...data]))
    }
  });

  // Receive the signal with socket for the new user login
  socket.on(ChatConst.LOGGED_NEW_USER, (data) => {
    const { ID, Socket } = data;

    // Assuming userList is accessible here
    const updatedList = userList.map((user) => {
      if (user.Opposite_Id === ID) {
        return { ...user, Opposite_Id: ID, Socket };
      } else {
        return user;
      }
    });
    dispatch(setChatUserList([...updatedList]));
  });

  // Receive the signal with socket for the user logout
  socket.on(ChatConst.USER_OUT, (data) => {
    const oppositeId = data.ID;

    const modifyList: User[] = userList.map(user => {
      if (user.Opposite_Id === oppositeId) {
        return { ...user, Socket: false };
      }
      return user;
    });

    dispatch(setChatUserList([...modifyList]));
  });

  socket.on(ChatConst.USER_LOGGED_WILD_SUB, (data) => {
    console.log("==== RESULT ====", data);
    fetchSoundOption();
  });
  

  // when the time expired
  socket.on(ChatConst.EXPIRED, () => {
    localStorage.clear()
  })

  socket.on(ChatConst.USER_LOGGED, () => {  
  })


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
    if (prevMsgList.length <= msgList.length) {
      scrollToBottom();
    }
  }, [msgList]);

  // useEffect(() => {
  //   const container = scrollContainerRef.current
  //   if (!container) return

  //   scrollPositionRef.current = container.scrollTop
  // }, [msgList.length])

  // The action for messageList change
  // useEffect(() => {
  //   if (msgBox.current) {
  //     msgBox.current.scrollIntoView({ behavior: "smooth" })
  //     msgBox.current.scrollTop = msgBox.current.scrollHeight;
  //   }
  // }, [msgList]);

  // useEffect(() => {
  //   const container = scrollContainerRef.current
  //   if (!container) return

  //   const messageAdded = msgList.length > prevMsgCount.current

  //   if (messageAdded) {
  //     container.scrollTop = container.scrollHeight
  //   } else {
  //     container.scrollTop = scrollPositionRef.current
  //   }

  //   prevMsgCount.current = msgList.length
  // }, [msgList])

  // The action for the last chat date
  useEffect(() => {
    if (lastChatDate == 1) return;
    const token = localStorage.getItem(`MayaIQ_Token`);
    getGroupHistory(token, selectedGroupId, lastChatDate);
  }, [lastChatDate])

  // The action for the message send action
  const sendMsgHandler = () => {

  //   if (attachment?.type && attachment.type === 'file') {
  //     sendMsg(selectedUser?.Id, `<a className="inline-block text-cyan-300 hover:underline w-8/12 relative rounded-e-md" 
  //  href=${SERVER_URL + ""}/uploads/chats/files/${attachment.url}>File Name : ${attachment.url}</a>`
  //       , localStorage.getItem(`MayaIQ_Token`))
  //   } else if (attachment?.type && attachment.type === 'image') {
  //     sendMsg(selectedUser?.Id, `<img src='${SERVER_URL}/uploads/chats/images/${attachment?.url}' alt="" />`, localStorage.getItem(`MayaIQ_Token`))
  //   } else {
  //     if (inputMsg.length > 0) {
  //       const token = localStorage.getItem(`MayaIQ_Token`)
  //       sendMsg(selectedUser?.Id, inputMsg, token)
  //       setInputMsg("")
  //     }
  //   }
  //   setAttachment({ type: null, url: null })
  }

  // The action for the message send action
  const sendGroupMsgHandler = (type: string, value: string) => {
    console.log("===Message List ====", msgList);
    const selectedGroup = groupList.find((group => group.id == selectedGroupId)); 
    if (selectedGroup?.banned == 1) {
      toast.error("You can't send message now. You are banned.");
      setInputMsg("");
      return;
    }
    let receivers = selectedGroup?.members?.filter((member) => member.id != getCurrentUserId()).map(member => member.id); 
    if (receivers == null) receivers = []; 
    if (attachment?.type && attachment.type === 'file') {
      sendGroupMsg(selectedGroupId, `<a className="inline-block text-cyan-300 hover:underline w-8/12 relative rounded-e-md" 
      href=${SERVER_URL + ""}/uploads/chats/files/${attachment.url}>File Name : ${attachment.url}</a>`
        , localStorage.getItem(`MayaIQ_Token`), receivers, replyMsg?.Id)
    } else if (attachment?.type && attachment.type === 'image') {
      sendGroupMsg(
        selectedGroupId, 
        `<img src='${SERVER_URL}/uploads/chats/images/${attachment?.url}' alt="" />`, 
        localStorage.getItem(`MayaIQ_Token`), 
        receivers,
        replyMsg?.Id
      )
    } else {
      const token = localStorage.getItem(`MayaIQ_Token`);
      console.log("=== Role ====;", `MayaIQ_Token`);
      console.log("==== Send Message Token ====", token);
       if (type === "gif") {
        sendGroupMsg(selectedGroupId, value, token, receivers, replyMsg?.Id);
      } else if (type === "sticker") {
        sendGroupMsg(selectedGroupId, value, token, receivers, replyMsg?.Id);
      } else {
        if (inputMsg.length > 0) {        
          sendGroupMsg(selectedGroupId, inputMsg, token, receivers, replyMsg?.Id);       
          setInputMsg(""); 
          setShowEmoji(false);         
        }
      }      
    }
    setReplyMsg(null);
    setShowMsgReplyView(false);
    setAttachment({ type: null, url: null })
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
            'Authorization': localStorage.getItem(`MayaIQ_Token`) || "",
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
            'Authorization': localStorage.getItem(`MayaIQ_Token`) || "",
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
          'Authorization': localStorage.getItem(`MayaIQ_Token`) || "",
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

  const banUser = () => {
    if (banUserId == null) return;
    const token = localStorage.getItem(`MayaIQ_Token`)
    const selectedGroup = groupList.find((group => group.id == selectedGroupId)); 
    const receivers = selectedGroup?.members?.filter((member) => member.id != getCurrentUserId()).map(member => member.id); 
    banGroupUser(token, selectedGroupId, banUserId, receivers);
    setOpenBanUserConfirmPopup(false);
    setBanUserId(null);
  }

  const unbanUser = () => {
    const token = localStorage.getItem(`MayaIQ_Token`)
    const selectedGroup = groupList.find((group => group.id == selectedGroupId)); 
    const receivers = selectedGroup?.members?.filter((member) => member.id != getCurrentUserId()).map(member => member.id); 
    unbanGroupUser(token, selectedGroupId, getCurrentUserId(), receivers);
    setOpenUnbanReqConfirmPopup(false);
  }

  const deleteMessage = () => {    
    if (deleteMsgId == null) return;
    const token = localStorage.getItem(`MayaIQ_Token`)
    const selectedGroup = groupList.find(group => group.id == selectedGroupId); 
    let receivers = selectedGroup?.members?.filter((member) => member.id != getCurrentUserId()).map(member => member.id); 
    if (receivers == null) receivers = [];
    deleteGroupMsg(token, deleteMsgId, selectedGroup?.id, receivers);
    setOpenMsgDeleteConfirmPopup(false);
    setDeleteMsgId(null);
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

  const handleGroupMenuClick = (menuId: number) => {
    groupMemuPopoverRef.current?.click();
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
      return <span
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
    const itemIndex = msgList.findIndex(msg => msg.Id === msgId);
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

    // container.scrollTop = containerHeight;
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
            Authorization: localStorage.getItem(`MayaIQ_Token`),
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
            Authorization: localStorage.getItem(`MayaIQ_Token`),
          },
        });
      setMySoundOptionId(optionVal);
    } catch (error) {
      
    }    
    dispatch(setIsLoading(false));
  }

  const handleSignin = useCallback(async (email: string, password: string) => {
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
          localStorage.setItem("MayaIQ_User", res.data.id);
          localStorage.setItem(`MayaIQ_Token`, res.data.token);
          loginAsReal(res.data.token, selectedGroupId, getAnonId());
          setShowSigninPopup(false);
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
  

  return (
    <div className="page-container bg-white">      
      {/* Chats Area Start */}
      <div className="content-wrapper w-full max-lg:px-0 h-screen overflow-y-auto overflow-x-hidden">
        <div className="page-content w-full pt-[36px] flex flex-col px-[24px] pb-[24px] relative max-lg:px-[20px] max-lg:pt-0 max-lg:top-[52px] max-[810px]:pb-[20px]">
          {/* <PageHeader /> */}
          <div className={`flex justify-center gap-[20px] w-full relative ${isMobile ? "h-mob-chatbox" : "h-[calc(100vh-60px)]"}`}>
            {/* Chat Left Side Start ---Chat Hisotry */}
            
            {/* Chat Left Side End ---Chat History */}

            {/* Chat Right Side Start ---Message History */}
            <section className={`flex flex-col justify-between border border-gray-500 rounded-[10px] w-[50%] duration-500 max-[810px]:w-full`}>

              {/* Chat Right Side Header Start */}
              {selectedGroupId != 0 && <nav className="shadow-lg shadow-slate-300 select-none px-[20px] py-[16px] gap-[10px] border-b flex justify-between flex-wrap">
                <div className="flex gap-[16px] items-center">
                  <span className="hidden max-[810px]:flex"><FontAwesomeIcon icon={userNavShow ? faArrowRight : faArrowLeft} onClick={() => setUserNavShow(!userNavShow)} /></span>
                  
                  <div>
                    <p className="flex justify-start max-[810px]:flex-col items-center gap-[5px] whitespace-nowrap truncate">
                      <span className="text-[20px] font-bold truncate w-[100%]">{getSubDomain()}</span>
                  </p>
                  </div>
                </div>
                {getCurrentUserId() != 0 && <Popover placement="bottom-start" showArrow >
                  <PopoverTrigger>
                    <span className="max-[810px]:flex cursor-pointer" ref={groupMemuPopoverRef}><FontAwesomeIcon icon={faBars} className="text-[14px]" /></span>
                  </PopoverTrigger>
                  <PopoverContent className="bg-white dark:bg-zinc-100 border rounded-md shadow-md w-64">
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
                    </ul>
                  </PopoverContent>
                </Popover>}
                
              </nav>}
              {/* Chat Right Side Header End */}

              {/* Chat Article Start */}
              <article className="overflow-y-auto h-full flex flex-col px-[14px] pt-[20px] overflow-x-hidden min-h-20">
                <p className="text-center text-sm"><button onClick={() => setLastChatDate(lastChatDate + 1)}>Read More</button></p>
                <div className="flex flex-col gap-[6px] overflow-y-scroll" ref={scrollContainerRef} >
                  {msgList?.length ? msgList.map((message, idx) => {
                    if (message.group_id === selectedGroupId) {
                      return (
                        <div key={idx} ref={setMsgItemRef(idx)}>
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
                          ownMessage={message.Sender_Id === getCurrentUserId()}
                          isCreater={false}
                          read_time={message.Read_Time}
                          parentMsg={msgList.find(msg => msg.Id === message.parent_id)}
                          onDelete={messageDeleteButtonClicked}
                          onBanUser={userBanButtonClicked}
                          onReplyMessage={(msgId) => {
                            setReplyMsg(msgList.find(msg => msg.Id === msgId));
                            setShowMsgReplyView(true);
                          }}
                          onReplyMsgPartClicked={(msgId) => {
                            scrollToRepliedMsg(msgId);
                          }}
                          currUserid={getCurrentUserId()}
                        />
                        </div>
                        
                      );
                    }
                    return null;
                  }) : ""}</div>
              </article>
              {/* Chat Article End */}
              <nav className={`relative max-[320px]:px-[5px] gap-[10px] flex flex-col border-t ${isMobile ? "p-[8px]" : "px-[12px] py-[6px]"}`}>
                {/* start upload preview for image or file */}
                {attachment?.type && <div className="upload-preview relative">
                  {attachment.type === 'image' && <Image className="h-[100px] w-auto" src={`${SERVER_URL}/uploads/chats/images/${attachment.url}`} alt="" width={100} height={100} />}
                  {attachment.type === 'file' && (<div>File : ${attachment.url}</div>)}
                  <span onClick={handleRemoveAttachment} className="absolute top-0 right-0 text-xl cursor-pointer inline-block w-2 h-2">&times;</span>
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
                  
                  <div className="flex gap-[10px] min-w-[126px] relative cursor-pointer max-[810px]:w-full">
                    <Image onClick={() => imageUploadRef.current?.click()} className="w-[24px] h-[24px]" src={`/assets/light/chats/images.svg`} alt="" width={100} height={100} />
                    <input ref={imageUploadRef} type="file" onChange={handleImageUpload} className="hidden" accept="image/*" />
                    <Image onClick={() => fileUploadRef.current?.click()} className="w-[24px] h-[24px]" src={`/assets/light/chats/paperclip.svg`} alt="" width={100} height={100} />
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
                    <Image onClick={() => setShowEmoji(!showEmoji)} className={`w-[24px] h-[24px] ${showEmoji && "bg-gray-200"}`} src={`/assets/light/chats/smile.svg`} alt="" width={100} height={100} />
                    <Popover placement="bottom-start" showArrow >
                      <PopoverTrigger>
                        <Image 
                          className={`w-[24px] h-[24px] bg-gray-200`} 
                          src={mySoundOptionId == 0 || mySoundOptionId == null || mySoundOptionId == undefined ? `/assets/light/chats/speaker_off.svg` : `/assets/light/chats/speaker_on.svg`} 
                          alt="" 
                          width={100} 
                          height={100}
                          ref={soundMenuPopoverRef} />
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
                  <div className={`flex w-full items-center justify-between p-[6px] ${isMobile ? "pl-12px" : "pl-[16px]"} rounded-full border`}>
                    <input type="text" ref={inputMsgRef} onKeyDown={(e) => e.keyCode === 13 && sendGroupMsgHandler("msg", "")} value={inputMsg} onChange={(e) => setInputMsg(e.target.value)} className="w-full outline-none text-[14px] leading-[24px]" placeholder="Write a message" />
                    <button onClick={() => sendGroupMsgHandler("msg", "")} className="h-[30px] active:translate-y-[2px] py-[3px] max-[320px]:px-[12px] px-[26px] rounded-full text-[14px] max-[320px]:text-[10px] text-white bg-gradient-to-r from-[#BD00FF] to-[#3A4EFF]">
                      {isMobile ? <span className="hidden max-[810px]:flex"><FontAwesomeIcon icon={faPaperPlane} className="text-[16px]" /></span> : "Send"}
                    </button>
                  </div>
                </div>
                {/* Image Upload, File Upload, Emoticon End */}

                {/* Add Sign in button for the anons */}
                {(currentUserId == 0 || currentUserId == null) && <div className="z-[11] w-full h-full absolute bottom-[0px] right-[0px] py-[3px] border-t px-[8px]" onClick={() => {setShowSigninPopup(true)}}>
                  <div className="h-full w-full bg-white flex justify-center items-center cursor-pointer">
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
      <SigninPopup isOpen={showSigninPopup} onClose={() => setShowSigninPopup(false)} onSignin={handleSignin}/>
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
