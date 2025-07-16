import React from "react";
import Link from "next/link";

const ButtonGroup: React.FC = () => {
  return (
    <div className="text-center w-5/12 mx-auto max-[650px]:w-full justify-center grid grid-cols-1 max-[650px]:grid-cols-1 gap-[20px]">
      <Link
        // buyer auth or login
        href="/auth?Collection=login&Role=Customer"
        className="py-[17px] max-[650px]:py-[12px] w-full gap-[10px] text-[20px] leading-[30px] rounded-full text-white md:block whitespace-nowrap bg-gradient-to-r from-[#0F00D4] to-[#B300C8]"
      >
        Get Started
      </Link>
      {/* <Link
        href="/auth?Collection=login&Role=Vendor"
        className="py-[17px] max-[650px]:py-[12px] w-full gap-[10px] text-[20px] leading-[30px] rounded-full text-white md:block whitespace-nowrap border border-[#B300C8]"
      >
        Join as a Business
      </Link> */}
    </div>
  );
};

export default ButtonGroup;
