
'use client'

import toast from "react-hot-toast";
import axios from "axios";
import Image from "next/image";
import React, { Suspense, useEffect, useRef, useState, useCallback, ChangeEvent, MouseEvent } from "react";
import { useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudUpload, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { SERVER_URL } from "@/resource/const/const";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { setIsLoading } from "@/redux/slices/stateSlice";
import PageHeader from "@/components/pageHeader";
import SideBar from "@/components/sideBar";
import ImageCropper from "@/components/imageCropper";
import Switch from "@/components/switch";
import messages from "@/resource/const/messages";
import Confirm from "../mask/Confirm";


const CustomerProfile: React.FC = () => {

  // states for initial list
  const [emailNotification, setEmailNotification] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadImage, setUploadImage] = useState<File | null>(null);
  const [pushNotification, setPushNotification] = useState(true);
  const [removeAvatar, setRemoveAvatar] = useState(false)

  const inputImage = useRef<HTMLInputElement>(null);
  const params = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();

  // refs related to user detail information
  const firstNameRef = useRef<HTMLInputElement | null>(null)
  const lastNameRef = useRef<HTMLInputElement | null>(null)
  const emailRef = useRef<HTMLInputElement | null>(null)

  const currentPasswordRef = useRef<HTMLInputElement | null>(null)
  const newPasswordRef = useRef<HTMLInputElement | null>(null)
  const confirmPasswordRef = useRef<HTMLInputElement | null>(null)


  //get user detail information
  const loadUserDetail = useCallback(async () => {
    try {
      dispatch(setIsLoading(true))
      const res = await axios.post(`${SERVER_URL}/api/private/get/myProfile/detail`, {},
        {
          headers: {
            "Accept": "application/json",
            "Content-type": "application/json",
            Authorization: localStorage.getItem(`MayaIQ_Token`),
          }
        });


      if (firstNameRef.current && lastNameRef.current && emailRef.current) {

        let personal = res.data.personal[0]
        let name = personal.Name.split(' ');
        firstNameRef.current.value = name[0];
        lastNameRef.current.value = name.slice(1).join('');
        emailRef.current.value = personal.Email
        personal.Photo_Name && setPreviewImage(`${SERVER_URL}/uploads/users/${personal.Photo_Name}`)
      }

      dispatch(setIsLoading(false))
    } catch (error) {
      toast.error(messages.viewProfile.error);
    }
  }, [])

  useEffect(() => {
    loadUserDetail();
  }, [loadUserDetail]);

  const removeAvatarHandler = async () => {
    try {
      await axios.post(`${SERVER_URL}/api/private/delete/avatar`, {}, {
        headers: {
          "Accept": "application/json",
          "Content-type": "application/json",
          Authorization: localStorage.getItem(`MayaIQ_Token`),
        }
      })
      toast.success(messages.vendorProfile.avatarDeleteSuccess)
      setRemoveAvatar(false)
      loadUserDetail()
    } catch (error) {
      toast.error(messages.vendorProfile.avatarDeleteFailure)
    }
  }


  // update user avatar
  const avatarUpload = async () => {
    try {
      dispatch(setIsLoading(true))
      const formData = new FormData();
      formData.append("Image", uploadImage!);
      const response = await axios.post(`${SERVER_URL}/api/private/update/users/photo`, formData, {
        headers: {
          "Accept": "application/json",
          'Content-Type': 'multipart/form-data',
          'Authorization': localStorage.getItem(`MayaIQ_Token`) || "",
        }
      });
      toast.success(messages.vendorProfile.changeAvatarSuccess)
      setUploadImage(null)
    } catch (error) {
      console.log(error)
    }
    dispatch(setIsLoading(false))
  }

  useEffect(() => {
    uploadImage && avatarUpload()
  }, [previewImage])

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setPreviewImage(URL.createObjectURL(file));
    }
  };


  // To update the personal Infor
  const updatePersonalInfor = async (event: MouseEvent<HTMLButtonElement>) => {

    event.preventDefault();
    if (firstNameRef.current && firstNameRef.current.value && lastNameRef.current && lastNameRef.current.value && emailRef.current && emailRef.current.value) {

      //When all form are filled
      dispatch(setIsLoading(true))
      try {

        await axios.post(`${SERVER_URL}/api/private/update/customer/detail`, {
          FirstName: firstNameRef.current.value,
          LastName: lastNameRef.current.value,
          Email: emailRef.current.value
        },
          {
            headers: {
              "Accept": "application/json",
              "Content-type": "application/json",
              Authorization: localStorage.getItem(`MayaIQ_Token`),
            },
          });
        toast.success(messages.viewProfile.updatesuccess);

      } catch (error) {
        toast.error(messages.common.serverError);
      }
      dispatch(setIsLoading(false))
    } else {
      // When there is any empty form
      if (!firstNameRef.current?.value) {
        firstNameRef.current?.focus();
      } else if (!lastNameRef.current?.value) {
        lastNameRef.current?.focus()
      } else
        emailRef.current?.focus()
    }
  }

  // To set new password
  const setNewPassword = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    dispatch(setIsLoading(true))
    if (currentPasswordRef.current && currentPasswordRef.current.value && newPasswordRef.current && newPasswordRef.current.value && confirmPasswordRef.current && confirmPasswordRef.current.value) {
      if (newPasswordRef.current.value !== confirmPasswordRef.current.value) {
        toast.error(messages.viewProfile.confirmPassword)
        newPasswordRef.current.value = ""
        confirmPasswordRef.current.value = ""
      } else {
        try {
          await axios.post(`${SERVER_URL}/api/private/update/password`, {
            CurrentPassword: currentPasswordRef.current.value,
            NewPassword: newPasswordRef.current.value
          },
            {
              headers: {
                "Accept": "application/json",
                "Content-type": "application/json",
                Authorization: localStorage.getItem(`MayaIQ_Token`),
              },
            });
          toast.success(messages.viewProfile.updatesuccess);

        } catch (error) {
          toast.error(messages.common.serverError);
        }
        dispatch(setIsLoading(false))
      }
    } else {
      if (!currentPasswordRef.current?.value) {
        currentPasswordRef.current?.focus();
      } else if (!newPasswordRef.current?.value) {
        newPasswordRef.current?.focus()
      } else if (!confirmPasswordRef.current?.value) {
        confirmPasswordRef.current?.focus()
      }
    }
    dispatch(setIsLoading(false))
  }

  return (
    <div className="page-container bg-white">
      <SideBar />
      <div className="content-wrapper w-full pl-[280px] max-lg:px-0 h-screen overflow-y-auto overflow-x-hidden">
        <div className="page-content w-full pt-[37px] flex flex-col gap-[12px] p-[24px] pb-[80px] relative max-lg:px-[20px] max-lg:pt-0 max-lg:top-[102px]">
          <PageHeader />

          <div className="grid grid-cols-2 gap-[20px] max-[1160px]:grid-cols-1">
            {/* Personal Information */}
            <div className="border rounded-lg w-full">
              <h4 className="text-[18px] py-[20px] px-[30px] truncate font-semibold border-b border-gray-400">
                Personal Information
              </h4>
              <div className="p-[30px]">
                <div className=" flex flex-col gap-[36px]">
                  <div className="input-form gap-[16px] flex flex-col">
                    {/* Form Fields */}
                    <div className="gap-2 flex flex-col">
                      <p>First Name</p>
                      <input ref={firstNameRef} type="text"
                        className="w-full p-2 text-[14px] rounded-md outline-none border" />
                    </div>
                    <div className="gap-2 flex flex-col">
                      <p>Last Name</p>
                      <input ref={lastNameRef} type="text"
                        className="w-full p-2 text-[14px] rounded-md outline-none border" />
                    </div>
                    <div className="gap-2 flex flex-col">
                      <p>Email Address</p>
                      <input
                        ref={emailRef}
                        type="text"
                        className="w-full p-2 text-[14px] rounded-md outline-none border"
                      />
                    </div>
                  </div>

                  <div className="py-3">
                    <button className="w-full p-2 border-none hover:opacity-90 text-[14px] rounded-md bg-gradient-to-r from-[#0F00D4] to-[#B300C8] text-white"
                      onClick={updatePersonalInfor}
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* Profile Picture */}
            <div className="border rounded-lg w-full">
              <h4 className="text-[18px] py-[20px] px-[30px] truncate font-semibold border-b border-gray-400 flex justify-between">
                <span>Profile Picture</span>
              </h4>
              <div className="flex justify-center items-center p-[30px]">
                <div
                  onClick={() =>
                    inputImage.current && inputImage.current.click()
                  }
                  onChange={handleImageChange}
                  className="w-full text-center flex flex-col items-center relative cursor-pointer"
                >
                  <Image
                    className="rounded-xl inline-block select-none "
                    src={`${previewImage && previewImage !== "null" ? previewImage : "/default_product.png"}`}
                    alt="avatar"
                    width={400}
                    height={400}
                    style={{ width: "100%", height: "auto" }}
                    priority
                  />

                  <ImageCropper onCropComplete={(e) => setPreviewImage(e)} onFileSendHandler={(e) => setUploadImage(e)} />
                  <span className="block">
                    <Image
                      className="inline-block mx-1"
                      src={`/assets/colorPencil.svg`}
                      alt="pencil"
                      width={100}
                      height={100}
                      style={{ width: "14px", height: "auto" }}
                      priority
                    />
                    <span className=" text-[14px] py-5 inline-block bg-gradient-to-r from-[#0F00D4] to-[#B300C8] bg-clip-text bg-transparent">
                      Update Profile Picture
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>


          {/* Change Password */}
          <div className="border rounded-lg w-full">
            <h4 className="text-[18px] py-[20px] px-[30px] truncate font-semibold border-b border-gray-400 flex justify-between">
              Change Password
            </h4>
            <div className="w-full grid grid-cols-3 gap-5 p-5 max-md:grid-cols-1">
              <div>
                <p>Current Password</p>
                <input ref={currentPasswordRef} type="password" name="old_pass"
                  className="w-full p-2 text-[14px] outline-none rounded-md border" />
              </div>
              <div>
                <p>Enter New Password</p>
                <input ref={newPasswordRef} type="password" name="new_pass"
                  className="w-full p-2 text-[14px] outline-none rounded-md border" />
              </div>
              <div>
                <p>Confirm New Password</p>
                <input
                  ref={confirmPasswordRef}
                  type="password"
                  name="confirm_pass"
                  className="w-full p-2 text-[14px] outline-none rounded-md border"
                />
              </div>
            </div>
            <div className="p-5">
              <button className="w-full hover:opacity-90 p-2 bg-gradient-to-r from-[#0F00D4] to-[#B300C8] rounded-md text-white"
                onClick={setNewPassword}
              >
                Set New Password
              </button>
            </div>
          </div>

          {/* Notification Settings */}
          {params.get("Role") === "Customer" && (
            <div className="border rounded-md w-full p-5">
              <div className="flex items-center my-1">
                <span className="inline-block w-60 font-semibold">
                  Receive Email Notification
                </span>
                <Switch
                  action={setEmailNotification}
                  state={emailNotification}
                />
              </div>
              <div className="flex items-center">
                <span className="inline-block w-60 my-1 font-semibold">
                  Receive Push Notification
                </span>
                <Switch action={setPushNotification} state={pushNotification} />
              </div>
            </div>
          )}
        </div>
      </div>
      <Confirm isShow={removeAvatar} close={setRemoveAvatar} msg="Do you really want to remove your avatar?" callback={removeAvatarHandler} />
    </div>
  );
};


const CustomerProfileWrapper: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CustomerProfile />
    </Suspense>
  );
};

export default CustomerProfileWrapper;