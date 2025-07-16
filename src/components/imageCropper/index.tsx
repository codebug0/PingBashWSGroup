'use client'
import React, { useState } from 'react';
import Cropper from 'react-easy-crop';

interface Props {
  onCropComplete: (croppedImage: string) => void;
  onFileSendHandler: (file: File) => void;
}

const ImageCropper: React.FC<Props> = ({ onCropComplete, onFileSendHandler }) => {
  const [image, setImage] = useState<string | null>(null); // Store image URL instead of File object
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedImage = e.target.files[0];
      setImage(URL.createObjectURL(selectedImage));
    }
  };

  const handleCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropClick = () => {
    const imageObj = new Image();
    imageObj.src = image as string; // Use the stored image URL

    imageObj.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const scaleX = imageObj.naturalWidth / imageObj.width;
      const scaleY = imageObj.naturalHeight / imageObj.height;

      canvas.width = 405;
      canvas.height = 196;

      ctx?.drawImage(
        imageObj,
        croppedAreaPixels.x * scaleX,
        croppedAreaPixels.y * scaleY,
        croppedAreaPixels.width * scaleX,
        croppedAreaPixels.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      );

      canvas.toBlob((blob) => {
        const croppedImage = new File([blob as Blob], 'cropped.jpg');
        onFileSendHandler(croppedImage)
        onCropComplete(URL.createObjectURL(croppedImage));
      }, 'image/jpeg', 1);
    };
    setImage(null)
  };

  return image ? (
    <div className="image-cropper bg-blue-950 bg-opacity-80 backdrop-blur-sm fixed w-screen top-0 left-0 h-screen z-50 flex flex-col justify-center items-center">

      <div className='bg-white shadow-md shadow-slate-800 rounded-lg relative w-fit'>
        <h1 className='text-xl font-semibold py-3 text-left px-5 flex justify-between'>
          <span>Crop your picture</span>
          <span onClick={(e) => { setImage(null) }}>&times;</span></h1>
        <hr />

        <div className="cropper-container w-[405px] max-sm:w-[90%] aspect-[405/196] relative bg-cyan-300 rounded-lg m-3">
          <Cropper
            image={image} // Use the stored image URL
            crop={crop}
            classes={{ cropAreaClassName: "rounded-lg", containerClassName: "rounded-lg", mediaClassName: "bg-red-500" }}
            zoom={zoom}
            objectFit='horizontal-cover'
            aspect={405 / 196}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            showGrid={false}
            onCropComplete={handleCropComplete}
          />
        </div>

        <hr />
        <div className='flex gap-10 justify-center'>
          <button className=" m-3 rounded-lg w-full py-1 shadow-sm shadow-slate-800 px-3 bg-gradient-to-r from-[#0F00D4] to-[#B300C8] text-white" onClick={handleCropClick}>Apply</button>
        </div>
      </div>
    </div>
  ) : <input type="file" className='absolute w-full h-full opacity-0 top-0 left-0 cursor-pointer' accept="image/*" onChange={handleFileChange} />
};

export default ImageCropper;
