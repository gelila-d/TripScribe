import React, { useRef, useState, useEffect } from 'react'
import { FaRegFileImage } from 'react-icons/fa'
import { MdDeleteOutline } from 'react-icons/md'

const ImageSelector = ({ image, setImage, handleDeleteImg }) => {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (image && typeof image !== "string") {
      const url = URL.createObjectURL(image);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (typeof image === "string") {
      setPreviewUrl(image);
    } else {
      setPreviewUrl(null);
    }
  }, [image]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const onChooseFile = () => {
    inputRef.current.click();
  };

  const handleRemoveImage = () => {
    setImage(null);
    handleDeleteImg();
  };

  return (
    <div>
      <input
        type='file'
        accept='image/*'
        ref={inputRef}
        onChange={handleImageChange}
        className='hidden'
      />

      {!image ? (
        <button 
          type="button"
          className='w-full h-[220px] flex flex-col items-center justify-center gap-4 bg-slate-50 rounded border border-slate-200/50' 
          onClick={onChooseFile}
        >
          <div className='w-14 h-14 flex items-center justify-center bg-purple-50 rounded-full border border-purple-100'>
            <FaRegFileImage className='text-xl text-purple-500' />
          </div>
          <p className='text-sm text-slate-500'>Browse image files to upload</p>
        </button>
      ) : (
        <div className='w-full relative'>
          <img
            src={previewUrl}
            alt='Selected'
            className='w-full h-[220px] object-cover rounded-lg'
          />
          
       
          <button
            type="button"
            className='btn-delete absolute top-2 right-2 p-2 rounded-full'
            onClick={handleRemoveImage}
          >
            <MdDeleteOutline className='text-lg' />
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageSelector;