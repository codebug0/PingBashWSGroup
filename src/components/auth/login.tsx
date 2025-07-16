import React, { useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import httpCode from "../../resource/const/httpCode";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import toast from "react-hot-toast";
import { SERVER_URL } from "@/resource/const/const";
import messages from "../../resource/const/messages";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { setIsLoading } from "@/redux/slices/stateSlice";
import { userLoggedIn } from "@/resource/utils/chat";

const Login: React.FC = () => {
  const params = useSearchParams();
  const router = useRouter();

  const [passShow, setPassShow] = useState(false)

  const email = useRef<HTMLInputElement | null>(null);
  const password = useRef<HTMLInputElement | null>(null);

  const dispatch = useDispatch<AppDispatch>();

  const logInHandler = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (email.current && email.current.value && password.current && password.current.value) {

      dispatch(setIsLoading(true));
      try {
        const res = await axios.post(`${SERVER_URL}/api/user/login`, {
          Email: email.current.value,
          Password: password.current.value,
          Role: 1,
        });

        // Error Notification
        if (res.status === httpCode.SUCCESS) {
          toast.success(messages.login.success);
          localStorage.setItem("MayaIQ_User", res.data.id);
          localStorage.setItem(`MayaIQ_Token`, res.data.token);
          userLoggedIn(res.data.token)
          router.push(`dashboard?Role=${params.get("Role")}`);

        } else if (res.status === httpCode.NOT_MATCHED) {
          toast.error(messages.common.notMatched);
        } else if (res.status === httpCode.NOT_ALLOWED) {
          toast.error(messages.common.notAllowed);
          // add redirect to email verify part
          router.push(`auth?Collection=signVerify&Email=${email.current.value}&Type=forgotPass&Role=${params.get("Role")}`)
          //add here
        } else {
          toast.error(messages.common.failure);
        }

      } catch (error) {
        toast.error(messages.common.serverError);
      }
      dispatch(setIsLoading(false));
    }
    // When Password or Email form is empty
    else {
      if (!email.current?.value) {
        email.current?.focus();
      } else {
        password.current?.focus();
      }
    }
  };

  return (
    <div className="Login bg-white flex flex-row justify-center items-center w-full">
      <div className="left-side flex items-center w-full md:w-1/2 pt-8 overflow-x-auto h-screen max-[320px]:h-full overflow-y-auto">
        <div className="login_container mx-8 max-[320px]:mx-4">
          <div className="top_mayaIq flex">
            <Link href="/">
              <Image src="/logo-orange.png" alt="logo" width={100} height={100} style={{ width: "auto", height: "auto" }} />
            </Link>
            <p className="flex items-center text-3xl font-bold pl-4">Chatgram</p>
          </div>
          <div className="welcomeback pt-4">
            <p className="title text-2xl font-bold  max-[320px]:text-md">Welcome Back!</p>
            <p className="description pt-4 text-sm">
              Lorem ipsum dolor sit amet consectetur. Risus enim scelerisque fermentum fermentum. Risus enim scelerisque.
            </p>
          </div>


          {/* <button className="flex my-5 bg-gray-100 hover:bg-white w-full justify-center items-center border p-2 rounded-full">
            <Image className="mx-2" src={`/assets/googleAuthLogo.svg`} width={100} height={100} alt="" style={{ width: "auto", height: "auto" }} priority />
            <span className="font-semibold max-[320px]:text-sm">Continue with Google</span>
          </button>
          <button className="flex my-5 bg-gray-100 hover:bg-white w-full justify-center items-center border p-2 rounded-full">
            <Image className="mx-2" src={`/assets/appleAuthLogo.svg`} width={100} height={100} alt="" style={{ width: "auto", height: "auto" }} priority />
            <span className="font-semibold max-[320px]:text-sm">Continue with Apple</span>
          </button>

          <div className="flex items-center justify-between max-[320px]:text-sm">
            <hr className="w-5/12 border" />
            <span>Or</span>
            <hr className="w-5/12 border" />
          </div> */}

          <div className="email_area pt-2 max-[320px]:text-sm">
            <p className="font-bold">Email Address</p>
            <input type="text" ref={email} placeholder="example@example.com"
              className="w-full px-5 border border-gray-500 bg-gray-100 rounded-full p-2" />
          </div>
          <div className="password_area pt-4 max-[320px]:text-sm">
            <p className="font-bold">Password</p>
            <div className="relative">
              <input type={passShow ? "text" : "password"} ref={password} placeholder={passShow ? "Password" : "********"}
                className="w-full border border-gray-500 bg-gray-100 rounded-full px-5 pr-10 py-2" />
              <span onClick={() => { setPassShow(!passShow) }} className="absolute inset-y-0 right-0 flex items-center pr-2">
                <Image src={`/assets/${passShow ? "passHide" : "passShow"}.svg`} alt="Eye Icon" className="eye" width={100} height={100} style={{ width: "auto", height: "auto" }} />
              </span>
            </div>
          </div>
          <div className="login_btn pt-4 text-white w-full mt-5">
            <button onClick={logInHandler}
              className="inline-block px-4 py-2 rounded-full text-white font-bold bg-gradient-to-r from-[#0F00D4] to-[#B300C8] w-full text-center max-[320px]:text-sm"
            >
              Log in
            </button>
          </div>
          <div className="extra_area pt-6 flex flex-col items-center">
            <div className="signup_ms flex flex-wrap max-[320px]:text-sm">
              <p>Don&apos;t have an account?</p>
              <Link
                href={`/auth?Collection=signUp&Role=${params.get("Role")}`}
                className="pl-1 text-purple-900 font-bold underline max-[320px]:text-sm  max-[320px]:w-full text-center"
              >
                Sign Up
              </Link>
            </div>
            <Link
              href={`/auth?Collection=forgotPass&Role=${params.get("Role")}`}
              className="text-purple-900 font-bold underline max-[320px]:text-sm"
            >
              Forgot password?
            </Link>
          </div>
        </div>
      </div>
      <div className="right-side w-full md:w-1/2 hidden md:block">
        <Image src="/login.png" alt="" width={400} height={800} className="w-full h-screen object-cover" priority />
      </div>
    </div>
  );
};

export default Login;
