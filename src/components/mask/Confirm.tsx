/**
 * @author      Mykola
 * @published   May 25, 2024
 * @description
 ** confirm page to leave suggestion of users
 */
import React from "react";

type ConfirmProps = {
  isShow: boolean;
  close: (isShow: boolean) => void;
  msg?: string;
  callback?: () => void;
  refresh?: () => void;
};

const Confirm: React.FC<ConfirmProps> = ({ isShow, close, msg, callback, refresh }) => {
  const callbackHandler = async () => {
    if (callback) await callback()
    if (refresh) await refresh()
    close(false)
  }

  return (
    <div
      className={`w-screen h-screen z-50 bg-blue-950 bg-opacity-50 backdrop-blur-sm fixed top-0 left-0 flex justify-center items-center ${isShow ? "" : "hidden"
        }`}>

      <div className="bg-white rounded-lg select-none min-w-[300px] max-sm:w-[300px] max-w-[500px] px-5 py-5 shadow-md shadow-slate-800">
        <div className="py-3 px-5 text-2xl text-center font-semibold">
          {msg || "Are you sure to delete?"}
        </div>
        <div className="flex justify-between gap-5">
          <button onClick={callbackHandler}
            className="bg-gradient-to-r from-[#0F00D4] to-[#B300C8] shadow-sm shadow-slate-400 rounded-md text-white font-bold py-1 px-3 m-2">
            Okay
          </button>
          <button onClick={() => close(false)}
            className="bg-gray-600 text-white font-bold py-1 px-3 m-2 rounded-md shadow-sm shadow-slate-400">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Confirm;