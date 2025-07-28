/**
 * @author      Mykola
 * @published   May 25, 2024
 * @description
 * Feedback page to leave suggestion of users
 */

import { setIsLoading, setShowFeedback } from "@/redux/slices/stateSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { SERVER_URL, TOKEN_KEY } from "@/resource/const/const";
import messages from "@/resource/const/messages";
import axios from "axios";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import React, { Suspense, useRef } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

interface FeedbackProps { }

const Feedback: React.FC<FeedbackProps> = () => {
  const showFeedback = useSelector((state: RootState) => state.state.showFeedback);
  const dispatch = useDispatch<AppDispatch>();
  const inputFeedback = useRef<HTMLTextAreaElement | null>(null);
  const params = useSearchParams();

  const submitFeedback = async () => {
    try {
      if (!inputFeedback.current?.value) inputFeedback.current?.focus();
      dispatch(setIsLoading(true))
      const res = await axios.post(`${SERVER_URL}/api/private/add/feedback`, { data: inputFeedback.current?.value }, {
        headers: {
          "Accept": "application/json",
          "Content-type": "application/json",
          Authorization: localStorage.getItem(TOKEN_KEY),
        }
      });
      toast.success(messages.common.successFeedback)
    } catch (error) {
      toast.error(messages.common.serverError)
    }
    dispatch(setIsLoading(false))
  };

  return showFeedback && (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="w-screen fixed h-screen top-0 left-0 z-50 flex justify-center items-center bg-blue-950 bg-opacity-60 backdrop-blur-sm">
        <div className="w-md max-sm:mx-5 bg-white px-5 py-3">
          <p onClick={() => dispatch(setShowFeedback(false))} className="text-xl cursor-pointer hover:text-gray-700 text-right">&times;</p>
          <div className="px-5 pb-5 max-sm:px-1">
            <div className="flex w-full items-center">
              <Image className="mx-2 inline-block" src={`/logo-orange.png`} width={100} height={100} alt="logo" style={{ width: "auto", height: "auto" }} priority />
              <span className="text-2xl font-semibold inline-block">Chatgram</span>
            </div>
            <h2 className="text-3xl font-semibold py-3 max-sm:text-2xl leading-7">How can we get better?</h2>
            <p className="text-gray-800 text-sm">Write a suggestion and send it to us to let us improve!</p>
            <h4 className="pt-3 text-sm font-semibold py-1">Your Feedback</h4>
            <textarea ref={inputFeedback} id="leave_feedback" className="w-full p-3 text-sm border outline-none rounded-lg resize-none" rows={5} placeholder="Write here..." />
            <button onClick={submitFeedback} className="w-full my-5 bg-gradient-to-r py-2 rounded-md from-[#0F00D4] to-[#B300C8] text-white" >Submit</button>
          </div>
        </div>
      </div>
    </Suspense>
  );
};

export default Feedback;