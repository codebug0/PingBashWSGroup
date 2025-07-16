/**
 * @author      Mykola
 * @published   May 8, 2024
 * @description
 ** Set New Password page for MayaIQ page
 */

import React, { useRef, useState } from "react";
import Image from "next/image";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { SERVER_URL } from "../../resource/const/const";
import messages from "../../resource/const/messages";
import { AppDispatch } from "@/redux/store";
import { useDispatch } from "react-redux";
import { setIsLoading } from "@/redux/slices/stateSlice";

const SetNewPass: React.FC = () => {
  const params = useSearchParams();
  const router = useRouter();
  const path = usePathname();

  const [newPass, setNewPass] = useState<string>("");
  const [showNewPass, setShowNewPass] = useState<boolean>(false);
  const [showConfirmPass, setShowConfirmPass] = useState<boolean>(false);
  const [confirmPass, setConfirmPass] = useState<string>("");

  const passRef = useRef<HTMLInputElement | null>(null);
  const confirmRef = useRef<HTMLInputElement | null>(null);

  const dispatch = useDispatch<AppDispatch>();

  const handleSetNewPassword = async () => {
    if (newPass.length < 1) {
      toast.error(messages.setNewPassword.inputNewPassword);
      passRef.current?.focus();
      return;
    } else if (newPass.length < 6) {
      toast.error(messages.setNewPassword.lessCharacter);
      return;
    } else if (newPass !== confirmPass) {
      toast.error(messages.setNewPassword.confirmError);
      setConfirmPass("");
      confirmRef.current?.focus();
      return;
    }

    dispatch(setIsLoading(true));
    try {
      const res = await axios.post(
        `${SERVER_URL}/api/user/setNewPass`,
        {
          newPass: newPass,
          confirmPass: confirmPass,
          email: params.get("Email"),
        },
        {
          headers: {
            Accept: "application/json",
            "Content-type": "application/json",
          },
        }
      );

      toast.success(messages.setNewPassword.success);
      router.push(`${path}?Collection=passSetSuccess&Role=${params.get("Role")}`);
    } catch (error) {
      toast.error(messages.common.serverError);
    }
    dispatch(setIsLoading(false));
  };

  return (
    <div className="setNewPass flex justify-center items-center h-screen max-[320px]:h-full">
      <div className="setNewPass_container bg-white p-8 w-5/12 min-w-[230px] shadow-lg rounded-lg">
        <div className="top_mayaIq flex items-center">
          <Image
            src="/logo-orange.png"
            alt="logo" className="logo" width={100} height={100}
            style={{ width: "auto", height: "auto" }}
          />
          <p className="text-3xl font-bold pl-4">Chatgram</p>
        </div>

        <div className="setNewPass pt-4">
          <p className="title text-2xl font-bold leading-7">Set New Password</p>
          <p className="description pt-4 text-sm">
            Lorem ipsum dolor sit amet consectetur. Risus enim scelerisque
            fermentum fermentum. Risus enim scelerisque.
          </p>
        </div>

        <div className="currentPass_area pt-4 max-[320px]:text-sm">
          <p className="font-bold">Set New Password</p>
          <div className="relative">
            <input
              ref={passRef}
              type={showNewPass ? "text" : "password"}
              placeholder={showNewPass ? "New Password" : "******"}
              className="w-full border border-gray-500 rounded-full py-2 px-5"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
            />
            <span
              onClick={() => setShowNewPass(!showNewPass)}
              className="absolute inset-y-0 right-0 flex items-center pr-2"
            >
              <Image
                src={`/assets/${showNewPass ? "passHide" : "passShow"}.svg`}
                alt="" width={100} height={100}
                style={{ width: "auto", height: "auto" }}
              />
            </span>
          </div>
        </div>

        <div className="setNewPass_area pt-4 max-[320px]:text-sm">
          <p className="font-bold">Confirm New Password</p>
          <div className="relative">
            <input
              ref={confirmRef}
              type={showConfirmPass ? "text" : "password"}
              placeholder={showConfirmPass ? "Confirm Password" : "******"}
              className="w-full border border-gray-500 rounded-full px-5 py-2"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
            />
            <span
              onClick={() => setShowConfirmPass(!showConfirmPass)}
              className="absolute inset-y-0 right-0 flex items-center pr-2"
            >
              <Image
                src={`/assets/${showConfirmPass ? "passHide" : "passShow"}.svg`}
                alt="" width={100} height={100}
                style={{ width: "auto", height: "auto" }}
              />
            </span>
          </div>
        </div>

        <div className="setNewPass_btn pt-4 text-white w-full my-2 max-[320px]:text-sm">
          <span
            className="inline-block px-4 py-2 rounded-full text-white font-bold bg-gradient-to-r from-[#0F00D4] to-[#B300C8] w-full text-center cursor-pointer"
            onClick={handleSetNewPassword}
          >
            Set New Password
          </span>
        </div>
      </div>
    </div>
  );
};

export default SetNewPass;
