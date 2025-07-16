/**
 * @author      Mykola
 * @published   May 8, 2024
 * @description
 ** Forgot password page for MayaIQ page
 */

 import React, { useRef, useState } from "react";
 import { useSearchParams, useRouter, usePathname } from "next/navigation";
 import Image from "next/image";
 import { SERVER_URL } from "../../resource/const/const";
 import axios from "axios";
 import toast from "react-hot-toast";
 import messages from "../../resource/const/messages";
 import { AppDispatch } from "@/redux/store";
 import { useDispatch } from "react-redux";
 import { setIsLoading } from "@/redux/slices/stateSlice";
 import httpCode from "@/resource/const/httpCode";
 
 const ForgotPass: React.FC = () => {
   const [email, setEmail] = useState<string>("");
   const emailRef = useRef<HTMLInputElement | null>(null);
   const dispatch = useDispatch<AppDispatch>();
 
   const params = useSearchParams();
   const router = useRouter();
   const path = usePathname();
 
   const sendInstruction = async () => {
     dispatch(setIsLoading(true));
     try {
       if (emailRef.current && emailRef.current.value) {
         const res = await axios.post(
           `${SERVER_URL}/api/user/resend`,
           { email: email },
           {
             headers: {
               Accept: "application/json",
               "Content-Type": "application/json",
             },
           }
         );
 
         if (res.status === httpCode.SUCCESS) {
           toast.success(messages.forgotPassword.success);
           router.push(`${path}?Collection=emailSent&Email=${email}&Type=forgotPass&Role=${params.get("Role")}`);
         } else {
           toast.error(messages.common.failure);
         }
       } else {
         toast.error(messages.forgotPassword.inputEmail);
         emailRef.current?.focus();
       }
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
     <div className="forgotPass flex justify-center items-center h-screen max-[320px]:text-sm">
       <div className="forgotPass_container bg-white p-8 max-[320px]:p-4 w-5/12 min-w-[230px] shadow-lg rounded-lg">
         <div className="top_mayaIq flex items-center">
           <Image src="/logo-orange.png" alt="logo" width={100} height={100} style={{ width: "auto", height: "auto" }} />
           <p className="text-3xl font-bold pl-4">Chatgram</p>
         </div>
 
         <div className="forgotPassword pt-4">
           <p className="title text-2xl font-bold">Forgot Password</p>
           <p className="description pt-4 text-sm">
             Lorem ipsum dolor sit amet consectetur. Risus enim scelerisque fermentum fermentum. Risus enim scelerisque.
           </p>
         </div>
 
         <div className="email_area pt-8">
           <p className="font-bold">Email Address</p>
           <input
             ref={emailRef}
             type="text"
             placeholder="example@example.com"
             className="w-full border border-gray-500 rounded-full py-2 px-5"
             value={email}
             onChange={(e) => setEmail(e.target.value)}
           />
         </div>
 
         <div className="forgotPass_btn pt-4 text-white w-full">
           <span
             onClick={sendInstruction}
             className="inline-block px-4 py-2 rounded-full text-white font-bold bg-gradient-to-r from-[#0F00D4] to-[#B300C8] w-full text-center cursor-pointer"
           >
             Send Instruction
           </span>
         </div>
       </div>
     </div>
   );
 };
 
 export default ForgotPass;
 