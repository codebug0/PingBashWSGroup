'use client'

import toast from "react-hot-toast";
import axios from "axios";
import Image from "next/image";
import React, { Suspense, useEffect, useRef, useState, useCallback, ChangeEvent, MouseEvent } from "react";
import { useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudUpload, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { SERVER_URL, GOOGLE_MAPS_API_KEY } from "@/resource/const/const";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { setIsLoading } from "@/redux/slices/stateSlice";
import PageHeader from "@/components/pageHeader";
import SideBar from "@/components/sideBar";
import ProductCard from "@/components/productCard";
import AddProduct from "@/components/profile/addProduct";
import ImageCropper from "@/components/imageCropper";
import Switch from "@/components/switch";
import messages from "@/resource/const/messages";
import Confirm from "../mask/Confirm";

interface Coords {
  lat: number;
  lng: number;
}


interface Country {
  name: {
    common: string;
  };
  latlng: [number, number];
}

interface Products {
  Id: number,
  Product_Name: string,
  Price: number,
  Photo_Name: string
}

const VendorProfile: React.FC = () => {

  // states for initial list
  const [emailNotification, setEmailNotification] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadImage, setUploadImage] = useState<File | null>(null);
  const [pushNotification, setPushNotification] = useState(true);
  // const [removeAvatar, setRemoveAvatar] = useState(false)
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [productList, setProductList] = useState<Products[]>([])

  const [professionInput, setProfessionInput] = useState<string>("");

  // states related to map data
  const [countries, setCountries] = useState<string[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<string[]>([]);
  const [addressInput, setAddressInput] = useState<string>("");
  const [clickedCoords, setClickedCoords] = useState<Coords>({ lat: 0, lng: 0 });
  const [mapCenter, setMapCenter] = useState<Coords>({ lat: 37.7749, lng: -122.4194, });

  const inputImage = useRef<HTMLInputElement>(null);
  const params = useSearchParams();
  const isEditProduct = useSelector((state: RootState) => state?.state.editProduct);

  const dispatch = useDispatch<AppDispatch>();

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  // refs related to user detail information
  const firstNameRef = useRef<HTMLInputElement | null>(null)
  const lastNameRef = useRef<HTMLInputElement | null>(null)
  const professionRef = useRef<HTMLInputElement | null>(null)
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null)
  const emailRef = useRef<HTMLInputElement | null>(null)
  const locationTypeRef = useRef<HTMLSelectElement | null>(null)
  const addressRef = useRef<HTMLInputElement | null>(null)

  const currentPasswordRef = useRef<HTMLInputElement | null>(null)
  const newPasswordRef = useRef<HTMLInputElement | null>(null)
  const confirmPasswordRef = useRef<HTMLInputElement | null>(null)

  // Function to retrieve coutries' list 
  const fetchCountries = useCallback(async () => {
    dispatch(setIsLoading(true))
    try {
      const response = await axios.get("https://restcountries.com/v3.1/all");
      const countryNames = response.data.map((country: any) => country.name.common);
      setCountries(countryNames);
    } catch (error) {
      toast.error(messages.signup.retrievingCountryListError)
    }
    dispatch(setIsLoading(false))
  }, []);


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

      //Start Set the personal Information initially
      if (firstNameRef.current && lastNameRef.current && professionRef.current && descriptionRef.current && emailRef.current && locationTypeRef.current && addressRef.current) {

        let personal = res.data.personal[0]
        let name = personal.Name.split(' ');
        firstNameRef.current.value = name[0];
        lastNameRef.current.value = name.slice(1).join('');
        descriptionRef.current.value = personal.Description
        emailRef.current.value = personal.Email
        locationTypeRef.current.value = personal.LocationType
        professionRef.current.value = personal.Profession
        setAddressInput(personal.Address)
        setMapCenter(personal.Geometry)
        personal.Photo_Name && setPreviewImage(`${SERVER_URL}/uploads/users/${personal.Photo_Name}`)
      }
      setProductList([...res.data.products])

      dispatch(setIsLoading(false))
    } catch (error) {
      toast.error(messages.viewProfile.error);
    }
  }, [])

  useEffect(() => {
    fetchCountries();
    loadUserDetail();
  }, [dispatch, params]);

  // const removeAvatarHandler = async () => {
  //   try {
  //     await axios.post(`${SERVER_URL}/api/private/delete/avatar`, {}, {
  //       headers: {
  //         "Accept": "application/json",
  //         "Content-type": "application/json",
  //         Authorization: localStorage.getItem(`MayaIQ_Token`),
  //       }
  //     })
  //     toast.success(messages.vendorProfile.avatarDeleteSuccess)
  //     setRemoveAvatar(false)
  //     loadUserDetail()
  //   } catch (error) {
  //     toast.error(messages.vendorProfile.avatarDeleteFailure)
  //   }
  // }

  // update user avatar
  const avatarUpload = async () => {
    console.log("preview", previewImage)
    console.log("file", uploadImage)
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


  const handleMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (event.latLng)
      setClickedCoords({ lat: event.latLng.lat(), lng: event.latLng.lng() });
  }, []);

  const handleAddressChange = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;
    setAddressInput(input);
    const filtered = countries.filter((country) => country.toLowerCase().includes(input.toLowerCase()));
    setFilteredCountries(filtered);
  };

  const handleCountrySelect = async (countryName: string) => {
    setAddressInput(countryName);
    setFilteredCountries([]);
    try {
      const response = await axios.get<Country[]>(`https://restcountries.com/v3.1/name/${countryName}`);
      const countryCoords = response.data[0].latlng;
      setMapCenter({ lat: countryCoords[0], lng: countryCoords[1] });
      setClickedCoords({ lat: countryCoords[0], lng: countryCoords[1] });
    } catch (error) {
      toast.error(messages.signup.mapAccessError);
    }
  };

  const createMarker = (map: google.maps.Map, position: google.maps.LatLngLiteral) =>
    new google.maps.Marker({ map, position });


  if (loadError) {
    return <div>Error loading map</div>;
  }

  // To update the personal Infor
  const updatePersonalInfor = async (event: MouseEvent<HTMLButtonElement>) => {

    event.preventDefault();
    if (firstNameRef.current && firstNameRef.current.value && lastNameRef.current && lastNameRef.current.value && professionRef.current && professionRef.current.value && descriptionRef.current && descriptionRef.current.value && emailRef.current && emailRef.current.value && locationTypeRef.current && locationTypeRef.current.value && addressRef.current && addressRef.current.value) {

      //When all form are filled
      dispatch(setIsLoading(true))

      try {

        await axios.post(`${SERVER_URL}/api/private/update/vendor/detail`, {
          FirstName: firstNameRef.current.value,
          LastName: lastNameRef.current.value,
          Profession: professionRef.current.value,
          Description: descriptionRef.current.value,
          Email: emailRef.current.value,
          LocationType: locationTypeRef.current.value,
          Address: addressRef.current.value,
          Geometry: clickedCoords,
          Role: 0
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
      } else if (!professionRef.current?.value) {
        professionRef.current?.focus()
      } else if (!descriptionRef.current?.value) {
        descriptionRef.current?.focus()
      } else if (!emailRef.current?.value) {
        emailRef.current?.focus()
      } else if (!locationTypeRef.current?.value) {
        locationTypeRef.current?.focus()
      }
      else addressRef.current?.focus()
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
        <div className="page-content w-full pt-[37px] flex flex-col gap-[12px] p-[24px] relative max-lg:px-[20px] max-lg:pt-0 max-lg:top-[102px]">
          <PageHeader />

          <div className="grid grid-cols-2 gap-[20px] max-md:grid-cols-1">
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
                      <p>Title/Profession</p>
                      <input type="text" ref={professionRef}
                        placeholder="Tell us about you in a few words..."
                        className="w-full border border-gray-500 rounded-md p-2 text-[14px]"
                      />
                    </div>
                    <div className="gap-2 flex flex-col">
                      <p>Description</p>
                      <textarea
                        ref={descriptionRef}
                        className="w-full p-2 text-[14px] rounded-md outline-none border resize-none"
                        id="description"
                        rows={3}
                      ></textarea>
                    </div>
                    <div className="gap-2 flex flex-col">
                      <p>Email Address</p>
                      <input
                        ref={emailRef}
                        type="text"
                        className="w-full p-2 text-[14px] rounded-md outline-none border"
                      />
                    </div>
                    <div className="gap-2 flex flex-col">
                      <p>Location Type</p>
                      <select
                        ref={locationTypeRef}
                        className="w-full p-2 text-[14px] rounded-md outline-none border"
                        id="locationType"
                      >
                        <option value="1">Online</option>
                        <option value="0">Offline</option>
                      </select>
                    </div>
                    {/* Input Location Area */}
                    <div className="gap-2 flex flex-col relative">
                      <p className="font-bold">Location Address</p>
                      <div className="text-center w-full absolute mt-[2.5em] z-10 p-[24px]">
                        <input
                          type="text"
                          ref={addressRef}
                          value={addressInput}
                          placeholder="Enter your current address"
                          className="w-full border text-[16px] border-gray-500 bg-gray-100 rounded-md p-2"
                          onChange={handleAddressChange}
                        />
                        {filteredCountries.length > 0 && (
                          <div className="h-40 overflow-y-auto shadow-sm shadow-gray-700 z-10 bg-white mt-1 p-2 border border-gray-300 rounded-lg w-full">
                            {filteredCountries.map((country, index) => (
                              <div key={index} onClick={() => handleCountrySelect(country)}
                                className="cursor-pointer hover:bg-gray-200 p-1 rounded-md"
                              >
                                {country}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>


                      {/* Input Map Area */}
                      <div className="Map_area w-full">
                        {isLoaded ? (
                          <GoogleMap
                            onClick={handleMapClick}
                            mapContainerStyle={{ width: "100%", height: "200px" }}
                            zoom={10}
                            center={mapCenter}
                            onLoad={(map) => {
                              if (clickedCoords.lat && clickedCoords.lng) {
                                createMarker(map, clickedCoords);
                              }
                            }}
                          />
                        ) : (
                          <div>Loading Map...</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="py-3">
                    <button className="w-full p-2 border-none hover:opacity-90 text-[14px] rounded-md bg-gradient-to-r from-[#0F00D4] to-[#B300C8] text-white"
                      onClick={updatePersonalInfor}>
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
                {/* <span>
                  <FontAwesomeIcon
                    onClick={() => avatarUpload()}
                    className="mx-2 hover:-translate-y-[2px] hover:opacity-80 cursor-pointer"
                    icon={faCloudUpload} />
                  <FontAwesomeIcon
                    onClick={() => setRemoveAvatar(true)}
                    className="mx-2 hover:-translate-y-[2px] text-red-500 hover:opacity-80 cursor-pointer"
                    icon={faTrashAlt}
                  />
                </span> */}
              </h4>
              <div className="flex justify-center items-center p-[30px]">
                <div
                  onClick={() => inputImage.current && inputImage.current.click()}
                  onChange={handleImageChange}
                  className="w-full text-center flex flex-col items-center relative cursor-pointer">

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

          {/* Product/Services */}
          <div className="border rounded-lg w-full">
            <h4 className="text-[18px] py-[20px] px-[30px] truncate font-semibold border-b border-gray-400 flex justify-between">
              <span className="inline-block">Product/Services</span>
              <span
                onClick={() => setShowNewProductModal(true)}
                className="inline-block text-[0.9em] bg-gradient-to-r cursor-pointer hover:brightness-50 from-[#0F00D4] to-[#B300C8] bg-clip-text text-transparent"
              >
                +Add New
              </span>
            </h4>
            <div className="p-5 gap-[20px] max-sm:px-0 grid grid-cols-3 max-xl:grid-cols-2 max-lg:grid-cols-2 max-md:grid-cols-1">


              {productList.length ? productList.map((product, idx) => <ProductCard
                key={`product-${idx}`}
                id={product.Id}
                product={product.Product_Name}
                price={product.Price}
                image={product.Photo_Name}
                editable={true}
                refresh={loadUserDetail}
              />) : <h4>No Product Service</h4>}
              {/* Add more ProductCard components as needed */}
            </div>

            {(showNewProductModal || isEditProduct) && <AddProduct refresh={loadUserDetail} close={setShowNewProductModal} />}
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
      {/* <Confirm isShow={removeAvatar} close={setRemoveAvatar} msg="Do you really want to remove your avatar?" callback={removeAvatarHandler} /> */}
    </div>
  );
};



const VendroProfileWrapper: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VendorProfile />
    </Suspense>
  );
};

export default VendroProfileWrapper;