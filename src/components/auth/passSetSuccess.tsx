/**
 * @author      Mykola
 * @published   May 8, 2024
 * @description
 ** Password Set Success for MayaIQ page
 */

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

const PassSetSuccess: React.FC = () => {

  const params = useSearchParams()

  return (
    <>
      <div className="pass_set_sucess flex justify-center items-center h-screen">
        <div className="container_for_this bg-white p-8 w-5/12 min-w-[230px] shadow-lg rounded-lg flex flex-col items-center">
          <Image src="/success.png" alt="success" className="pt-4" width={100} height={100} style={{ width: "auto", height: "auto" }}/>
          <p className="exp0 pt-4 text-center">Your Password was changed successfully!</p>
          <div className="button pt-4">
            <Link
              href={`/auth?Collection=login&Role=${params.get("Role")}`}
              className="back_to_login inline-block px-4 py-2 rounded-full text-white font-bold bg-gradient-to-r from-[#0F00D4] to-[#B300C8] w-full text-center max-[320px]:text-sm"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default PassSetSuccess;
