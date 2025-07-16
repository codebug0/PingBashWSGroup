'use client';

import React, { Suspense, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { SERVER_URL } from "@/resource/const/const";
import { useDispatch } from "react-redux";
import ListPopover from "./groups/ListPopup";
import { setSelectedChatUser } from "@/redux/slices/messageSlice";
import { Popover, PopoverTrigger, PopoverContent } from "@nextui-org/popover";

interface Group {
  id: number;
  name: string;
  creater_id: number;
  members: String[];
}

interface VendorCardProps {
  name: string;
  category: string;
  address: string;
  email: string;
  id: number;
  photo: string;
  myGroups: Group[];
  onAddToGroup: (userId: number, groupId: number) => void;  
}

const VendorCard: React.FC<VendorCardProps> = ({ 
    name, 
    category, 
    address, 
    email, 
    id, 
    photo,
    myGroups,
    onAddToGroup
  }) => {
  const param = useSearchParams();
  const path = usePathname();
  const dispatch = useDispatch();
  const router = useRouter()
  const [open, setOpen] = useState(false);
  const popoverTriggerRef = useRef<HTMLButtonElement>(null);

  // const addGroupTrigger = () => {
  //   dispatch(setSelectedChatUser({
  //     Id: id,
  //     Email: email,
  //     Photo_Name: photo,
  //     Address: address,
  //     Name: name,
  //     Profession: category
  //   }));
  //   router.push(`/chats?Role=${param.get("Role")}&User=${id}`)
  // };

  const handleSelect = (groupId: number) => {
    console.log("Selected:", groupId);
    popoverTriggerRef.current?.click();
    onAddToGroup(id, groupId);
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="w-full rounded-[18px] truncate p-5 shadow-md shadow-gray-500 cursor-pointer">
        <Image
          src={photo && photo !== "null" ? `${SERVER_URL}/uploads/users/${photo}` : "/images/product-default.png"}
          width={100}
          height={50}
          className="rounded-lg w-20 h-20 object-cover"
          style={{ width: "100%", height: "auto" }}
          priority
          alt="photos"
        />
        <div className="py-1">
          <h4 className="truncate">{name}</h4>
          {/* <p className="text-sm truncate">{category}</p> */}
        </div>
        <div className="py-1">
          <p className="text-sm truncate">
            <Image
              src={`/assets/light/dashboard/mail.svg`}
              alt="map"
              width={100}
              height={100}
              style={{ width: "auto", height: "1.1em", display: "inline" }}
              priority
            /> {email}
          </p>
        </div>
        <div className="text-sm grid grid-cols-2">
          <Link href={`${path}?${param.toString()}&User=${id}`} className="flex items-center w-full font-semibold">
            <Image
              className="inline-block px-[1px]"
              src={`/assets/viewProfile.svg`}
              alt="view profile"
              width={100}
              height={100}
              style={{ width: "auto", height: "1.1em" }}
              priority
            />
            <span className="inline-block text-sm truncate bg-gradient-to-r from-[#0F00D4] to-[#B300C8] bg-clip-text text-transparent">View Profile</span>
          </Link>
          <Popover placement="bottom-start" showArrow >
            <PopoverTrigger>
              <button className="flex items-center w-full font-semibold float-right-chil" ref={popoverTriggerRef}>
                <Image
                  className="inline-block px-[1px]"
                  src={`/assets/chatNow.svg`}
                  alt="chat now"
                  width={100}
                  height={100}
                  style={{ width: "auto", height: "1.1em" }}
                  priority
                />
                <span className="inline-block text-sm truncate bg-gradient-to-r from-[#0F00D4] to-[#B300C8] bg-clip-text text-transparent">Add To</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="bg-white dark:bg-zinc-100 border rounded-md shadow-md w-64">
              <ul className="flex flex-col gap-2">
                {myGroups.map((item, index) => (
                  <li
                    key={index}
                    className="px-3 py-2 rounded-md hover:bg-default-200 cursor-pointer"
                    onClick={() => handleSelect(item.id)}
                  >
                    {item.name}
                  </li>
                ))}
              </ul>
            </PopoverContent>
          </Popover>
          
        </div>
      </div>
      {/* <ListPopover items={myGroups} onItemClick={handleSelect} /> */}
    </Suspense>
  );
};

export default VendorCard;