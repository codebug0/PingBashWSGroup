import React, { Suspense, useState } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { SERVER_URL } from "../../resource/const/const";
import messages from "../../resource/const/messages";
import { AppDispatch } from "@/redux/store";
import { useDispatch } from "react-redux";
import { setIsLoading } from "@/redux/slices/stateSlice";
import OtpInput from "react-otp-input"
import Link from "next/link";
import httpCode from "@/resource/const/httpCode";
import { userLoggedIn } from "@/resource/utils/chat";

const SignVerify: React.FC = () => {
  const params = useSearchParams();
  const router = useRouter();
  const sendEmail = params.get("Email");

  const [otp, setOtp] = useState('____');

  const dispatch = useDispatch<AppDispatch>();

  /**
   * Function to submit the Verification Code
   */
  const handleSubmit = async () => {
    if (otp.length >= 4) {

      dispatch(setIsLoading(true));
      try {
        const res = await axios.post(`${SERVER_URL}/api/user/confirm`,
          { email: sendEmail, otp: Number(otp) },
          {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        );

        toast.success(messages.verifyEmail.success);        
        localStorage.setItem("MayaIQ_User", res.data.id)
        localStorage.setItem(`MayaIQ_Token`, res.data.token);
        userLoggedIn(res.data.token)
        router.push(`/dashboard?Role=${params.get("Role")}`);
        // if (params.get("Type") === "signUp") {
        //   router.push(`/dashboard?Role=${params.get("Role")}`);
        // } else {
        //   router.push(`/auth?Collection=setNewPass&Email=${params.get("Email")}&Role=${params.get("Role")}`);
        // }

      } catch (error: any) {
        console.log(error);
        toast.error(messages.verifyEmail.failure);
      } finally {
        dispatch(setIsLoading(false));
      }
    } else {
      toast.error(messages.verifyEmail.inputVerificationCode);
    }
  };

  /**
   * Function to resend OTP when it is needed
   */
  const handleResendFunction = async () => {
    dispatch(setIsLoading(true));
    try {
      await axios.post(
        `${SERVER_URL}/api/user/resend`,
        { email: sendEmail },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      toast.success(messages.resend.success);
    } catch (error: any) {
      if (error?.response?.status === httpCode.INVALID_MSG) {
        toast.error(messages.verifyEmail.invalidEmail);
      } else {
        toast.error(messages.common.serverError);
      }
    } finally {
      dispatch(setIsLoading(false));
    }
  };


  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="signVerify flex justify-center items-center h-screen max-[320px]:h-full">
        <div className="signVerify_container bg-white p-8 max-[320px]:p-4 w-5/12 min-w-[230px] shadow-lg rounded-lg">
          <div className="top_mayaIq ">
            <Link href="/" className=" flex items-center">
              <Image src="/logo-orange.png" alt="logo" width={100} height={100} style={{ width: "auto", height: "auto" }} />
              <p className="text-3xl font-bold pl-2">Chatgram</p>
            </Link>
          </div>

          <div className="signVerifyword pt-8">
            <p className="title text-2xl font-bold">Verify your email</p>
            <p className="description text-sm">
              We&apos;ve sent a verification code to <span className="font-semibold">{sendEmail}</span> (if you can&apos;t find the email in your inbox, please check your spam folder)
            </p>
          </div>

          <p className="pt-5 font-semibold">Verification Code:</p>
          <div className="verification_code_area flex w-full">
            <OtpInput
              value={otp}
              onChange={setOtp}
              containerStyle={{ width: "100%", justifyContent: "space-between" }}
              inputStyle={{ padding: "20px 10px", border: "1px solid gray", width: "23%", fontSize: "2.5em", borderRadius: "8px" }}
              numInputs={4}
              renderInput={(props) => <input {...props} />}
            />
          </div>

          <div className="signVerify_btn pt-8 text-white w-full max-[320px]:text-sm">
            <span onClick={handleSubmit}
              className="inline-block hover:opacity-90 px-4 py-2 rounded-full text-white font-bold bg-gradient-to-r from-[#0F00D4] to-[#B300C8] w-full text-center cursor-pointer">
              Submit
            </span>
          </div>

          <div className="extra_area pt-6 flex flex-col items-center max-[320px]:text-sm">
            <div className="verify_check flex">
              <p>Don&apos;t receive an email?</p>
              <span onClick={handleResendFunction}
                className="pl-1 bg-gradient-to-r hover:opacity-90 from-[#0F00D4] to-[#B300C8] bg-clip-text text-transparent font-bold underline cursor-pointer">
                Resend
              </span>
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
};

export default SignVerify;
