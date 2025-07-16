'use client'

import React, { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { useDispatch } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";

import { setIsExpanded } from "@/redux/slices/stateSlice";
import { AppDispatch } from "@/redux/store";
import { SERVER_URL } from "@/resource/const/const";
import httpCode from "@/resource/const/httpCode";
import messages from "@/resource/const/messages";
import { socket, userLoggedIn } from "@/resource/utils/chat";
import ChatConst from "@/resource/const/chat_const";

const PageHeader: React.FC = () => {
  const [name, setName] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);

  const path = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const params = useSearchParams();

  const [isMobile, setIsMobile] = useState(false);

  const getUserData = useCallback(async () => {
    try {
      const token = localStorage.getItem(`MayaIQ_Token`);
      const res = await axios.post(
        `${SERVER_URL}/api/private/get/myProfile/detail`,
        {},
        {
          headers: {
            "Accept": "application/json",
            "Content-type": "application/json",
            Authorization: token,
          },
        }
      );
      setName(res.data?.personal[0]?.Name);
      (res.data?.personal[0]?.Photo_Name && res.data?.personal[0]?.Photo_Name !== "null") && setAvatar(res.data?.personal[0]?.Photo_Name);
    } catch (error: any) {
      if (error.response?.status === httpCode.TOKEN_EXPIRED) {
        toast.error(messages.common.tokenExpired);
        router.push(`/auth?Role=${params.get("Role")}&Collection=login`);
      } else {
        // toast.error(messages.common.serverError);
      }
      console.error(error);
    }
  }, [params, router]);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    socket.on(ChatConst.REFRESH, () => {
      socket.emit(ChatConst.USER_LOGGED, { token: localStorage.getItem(`MayaIQ_Token`) });
      console.log("=== Socket Emit with Token ===; ", localStorage.getItem(`MayaIQ_Token`));
    })

    userLoggedIn(localStorage.getItem(`MayaIQ_Token`))

    // getUserData();
  }, [getUserData]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="lg:hidden bg-white shadow-lg shadow-slate-500 fixed z-20 w-full flex left-0 top-0 justify-start items-center gap-[20px] px-[20px] py-[10px]">
        <a onClick={() => dispatch(setIsExpanded(true))}>
          <FontAwesomeIcon className="cursor-pointer hover:text-gray-700 w-[24px] h-[24px]" icon={faBars} />
        </a>
        <div className="flex gap-[12px] items-center whitespace-nowrap">
          <Image src={'/logo-orange.png'} alt="" width={100} height={100} style={{ width: "56px", height: "56px" }} priority />
          <span className="text-[23px] font-semibold">Chatgram</span>
        </div>
      </div>
      {!isMobile && 
      <div className="page-header w-full flex justify-between items-center">
        <h1 className="text-[32px] max-lg:text-[36px] font-bold">
          {path === "/dashboard"
            ? params.get("Role") === "Customer"
              ? <span className=" max-sm:opacity-0">Explorer</span>
              : <span className=" max-sm:opacity-0">Customer</span>
            : path === "/assistant"
              ? <span className=" max-sm:hidden">Chatgram</span>
              : path.slice(1)[0].toUpperCase() + path.slice(2)}
        </h1>

        <div onClick={() => router.push(`/profile?Role=${params.get("Role")}`)} className="flex items-center justify-center">
          {avatar ? (
            <Image src={`${SERVER_URL}/uploads/users/${avatar}`} alt="" width={44} height={44} className="w-[44px] h-[44px] object-cover rounded-full" priority />
          ) : (
            <Image src="/assets/dark/user-default.svg" alt="user" width={44} height={44} priority />
          )}
        </div>
      </div>}
    </Suspense>
  );
};

export default PageHeader;
