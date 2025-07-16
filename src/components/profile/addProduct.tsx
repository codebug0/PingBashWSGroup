'use client'

import { setEditProduct, setIsLoading } from "@/redux/slices/stateSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { SERVER_URL } from "@/resource/const/const";
import { faTrash, faUpload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios, { AxiosResponse } from "axios";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import React, { Suspense, useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import ImageCropper from "../imageCropper";
import messages from "@/resource/const/messages";

interface Product {
  name: string;
  price: string;
}

interface AddProductProps {
  close: (value: boolean) => void,
  refresh: () => void;
}

const AddProductContent: React.FC<AddProductProps> = ({ close, refresh }) => {
  const productNameRef = useRef<HTMLInputElement>(null);
  const productPriceRef = useRef<HTMLInputElement>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [pdtImgBuffer, setPdtImgBuffer] = useState<string | null>(null);
  const params = useSearchParams();

  const dispatch = useDispatch<AppDispatch>();
  const isEditProduct = useSelector((state: RootState) => state.state.editProduct);

  const init = useCallback(() => {
    if (isEditProduct) {
      productNameRef.current!.value = isEditProduct.product;
      productPriceRef.current!.value = isEditProduct.price.toString();
      setPdtImgBuffer(`${SERVER_URL}/uploads/products/${isEditProduct.image}`);
    }
  }, [isEditProduct]);

  useEffect(() => {
    init();
  }, []);

  const addProductHandler = async () => {
    try {
      if (!productNameRef.current?.value || !productPriceRef.current?.value || !pdtImgBuffer) {
        throw new Error("Please fill all fields");
      }

      const formData = new FormData();
      if (isEditProduct) formData.append("Id", isEditProduct!.id.toString())
      formData.append("Image", uploadFile!);
      formData.append("Product_Name", productNameRef.current!.value);
      formData.append("Price", productPriceRef.current!.value);
      dispatch(setIsLoading(true));

      const response: AxiosResponse<Product> = await axios.post(`${SERVER_URL}/api/private/${isEditProduct ? "update" : "add"}/products`, formData, {
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
          Authorization: localStorage.getItem(`MayaIQ_Token`) || "",
        },
      });

      toast.success(isEditProduct ? messages.vendorProfile.updateProductSuccess : messages.vendorProfile.addProductSuccess);
      refresh()
      close(false);
      dispatch(setEditProduct(null))

    } catch (error) {
      toast.error("An error occurred!");
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  return (
    <div className="w-screen h-screen bg-blue-950 flex justify-center overflow-y-auto items-center bg-opacity-80 backdrop-blur-sm fixed top-0 left-0 z-40">
      <div className="p-5 bg-white mx-1 rounded-lg">
        <p className="text-right">
          <span onClick={(e) => { close(false); dispatch(setEditProduct(null)); }} className="inline-block px-2 cursor-pointer text-lg">
            &times;
          </span>
        </p>
        <h1 className="text-2xl font-bold my-2">{isEditProduct ? "Edit" : "Add"} Product/Services</h1>
        <div className="py-3">
          <span className="">Product/Service Name</span>
          <input ref={productNameRef} type="text"
            className="w-full border outline-none rounded-lg py-1 px-4 border-gray-500"
            placeholder="Ex. Web Development"
          />
        </div>
        <div className="py-3">
          <span className="">Price</span>
          <input
            type="number"
            ref={productPriceRef}
            className="w-full border outline-none rounded-lg py-1 px-4 border-gray-500"
            placeholder="$"
          />
        </div>
        <div className="py-3">
          <p className="flex justify-between">
            <span className="inline-block">Photo</span>
            <FontAwesomeIcon
              icon={faTrash}
              onClick={(e) => setPdtImgBuffer(null)}
              className="text-gray-600 hover:text-gray-800 cursor-pointer mr-3"
            />
          </p>
          <div className="border outline-none rounded-lg relative w-full border-dashed border-gray-500">
            {pdtImgBuffer ? (
              <Image className="rounded-lg" src={pdtImgBuffer} alt="" width={100} height={100} style={{ width: "100%", height: "196px" }} priority />
            ) : (
              <div className="text-center text-sm text-gray-600 p-5">
                <ImageCropper onCropComplete={(e) => setPdtImgBuffer(e)} onFileSendHandler={(e) => setUploadFile(e)} />
                <FontAwesomeIcon icon={faUpload} className="text-3xl" />
                <p>
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p>PNG, JPG or GIF</p>
              </div>
            )}
          </div>
        </div>
        <div className="py-3">
          <button
            onClick={addProductHandler}
            className="w-full hover:opacity-90 bg-gradient-to-r from-[#0F00D4] to-[#B300C8] p-2 rounded-lg text-white hover:brightness-80"
          >
            {isEditProduct ? "Update" : "Add"} Product
          </button>
        </div>
      </div>
    </div>
  );
};

const AddProduct: React.FC<AddProductProps> = (props) => (
  <Suspense fallback={<div>Loading...</div>}>
    <AddProductContent {...props} />
  </Suspense>
);

export default AddProduct;
