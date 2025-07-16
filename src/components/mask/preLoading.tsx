/**
 * @author      Mykola
 * @published   May 25, 2024
 * @description
 ** Loading page to leave suggestion of users
 */
'use client'

import React from "react";
import Image from "next/image";

const PreLoading = () => {

  return <div className="w-screen h-screen z-50 bg-blue-950 bg-opacity-50 backdrop-blur-sm fixed top-0 left-0 flex justify-center items-center">
    <Image src={`/assets/loading.svg`} width={100} height={100} alt="loading" className="w-[7em] max-sm:w-[4em] h-auto" priority />
  </div>
}

export default PreLoading