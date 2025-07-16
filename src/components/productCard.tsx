'use client'

import React, { Suspense, useState } from "react"
import Image from "next/image"
import { SERVER_URL } from "@/resource/const/const"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPencil, faTrash } from "@fortawesome/free-solid-svg-icons"
import axios from "axios"
import { useSearchParams } from "next/navigation"
import toast from "react-hot-toast"
import messages from "@/resource/const/messages"
import Confirm from "./mask/Confirm"
import { useDispatch } from "react-redux"
import { AppDispatch } from "@/redux/store"
import { setEditProduct, setIsLoading } from "@/redux/slices/stateSlice"

interface ProductCardProps {
  id: number,
  product: string,
  price: number,
  image: string,
  editable?: boolean,
  refresh?:()=>void;
}

const ProductCard: React.FC<ProductCardProps> = ({ id, product, price, image, editable, refresh }) => {

  const params = useSearchParams()
  const [confirmStatus, setConfirmStatus] = useState(false)
  const dispatch = useDispatch<AppDispatch>();

  const edit = () => {
    dispatch(setEditProduct({ product, price, image, id, }))
  }

  const remove = async () => {
    try {
      dispatch(setIsLoading(true))
      const result = await axios.post(`${SERVER_URL}/api/private/delete/product`, { Id: id }, {
        headers: {
          "Accept": "application/json",
          "Content-type": "application/json",
          Authorization: localStorage.getItem(`MayaIQ_Token`),
        }
      })
      toast.success(messages.vendorProfile.deleteProductSuccess)

    } catch (error) {
      toast.error(messages.common.serverError)
    }
    dispatch(setIsLoading(false))
  }

  return <Suspense fallback={<div>Loading...</div>}>
    <div className="w-full">
      <div className="shadow-md relative shadow-gray-500 rounded-xl cursor-pointer p-5 hover:shadow-gray-700">
        <Image className="rounded-xl" src={`${SERVER_URL}/uploads/products/${image}`} width={200} height={100} alt="" style={{ width: "100%", height: "auto" }} priority />
        <h2 className="text-xl font-bold">{product}</h2>
        <p className="text-lg inline-block font-bold bg-gradient-to-r from-[#0F00D4] to-[#B300C8] bg-clip-text text-transparent">${price}</p>
        <div className="absolute top-5 right-5 flex gap-3">
          {editable && <>
            <FontAwesomeIcon onClick={edit} className="w-[1em] h-[1em] bg-gray-200 hover:bg-blue-200 shadow-inner shadow-slate-800 rounded-full p-2" icon={faPencil} />
            <FontAwesomeIcon onClick={() => setConfirmStatus(true)} className="w-[1em] h-[1em] bg-gray-200 hover:bg-blue-200 shadow-inner shadow-slate-800 rounded-full p-2" icon={faTrash} />
          </>}
        </div>
      </div>
      <Confirm isShow={confirmStatus} refresh={refresh} close={setConfirmStatus} msg="Do you really want to delete this product?" callback={remove} />
    </div>
  </Suspense>
}

export default ProductCard