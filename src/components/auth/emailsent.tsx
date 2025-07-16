/**
 * @author      Mykola
 * @published   May 8, 2024
 * @description
 ** Email Sent page for MayaIQ page
 */

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

const EmailSent: React.FC = () => {
  const params = useSearchParams()
  return (
    <>
      <div className="emailsent flex justify-center items-center h-screen">
        <div className="emailsent_container bg-white p-8 w-5/12 min-w-[230px] shadow-lg rounded-lg">
          <div className="top_mayaIq flex items-center">
            <Image src="/logo-orange.png" alt="logo" width={100} height={100} style={{ width: "auto", height: "auto" }} />
            <p className="text-3xl max-[320px]:text-2xl font-bold pl-4">Chatgram</p>
          </div>

          <div className="emailsent pt-4">
            <Image src="/emailsent.png" alt="email sent" width={100} height={100} style={{ width: "auto", height: "auto" }}/>
            <p className="title text-2xl max-[320px]:text-xl font-bold">Email Sent</p>
            <p className="description pt-4 text-sm">
              Lorem ipsum dolor sit amet consectetur. Risus enim scelerisque
              fermentum fermentum. Risus enim scelerisque.
            </p>
          </div>

          <div className="emailsent_btn pt-4 text-white w-full max-[320px]:text-sm">
            <Link
              href={`/auth?Collection=signVerify&Email=${params.get("Email")}&Type=forgotPass&Role=${params.get("Role")}`}
              className="inline-block px-4 py-2 rounded-full text-white font-bold bg-gradient-to-r from-[#0F00D4] to-[#B300C8] w-full text-center"
            >Verify Email</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmailSent;
