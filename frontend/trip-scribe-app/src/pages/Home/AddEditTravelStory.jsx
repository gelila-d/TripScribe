import React, { useState, useEffect } from 'react';
import { MdAdd, MdUpdate, MdClose, MdDeleteOutline } from 'react-icons/md';
import DateSelector from '../../components/Input/DateSelector';
import ImageSelector from '../../components/Input/ImageSelector';
import TagInput from '../../components/Input/TagInput';
import moment from 'moment';
import axiosInstance from '../../utils/axiosInstance';
import uploadImage from '../../utils/uploadImage';
import { toast } from 'react-toastify';

const AddEditTravelStory = ({ storyInfo, type, onClose, onAddStory, onUpdateStory, onDeleteStory }) => {
  const [title, setTitle] = useState(storyInfo?.title || "");
  const [story, setStory] = useState(storyInfo?.story || "");
  const [visitedDate, setVisitedDate] = useState(storyInfo?.visitedDate || null);
  const [storyImg, setStoryImg] = useState(storyInfo?.imageUrl || null);
  const [visitedLocation, setVisitedLocation] = useState(storyInfo?.visitedLocations || []);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // New Loading State

  useEffect(() => {
    if (type === "edit" && storyInfo) {
      setTitle(storyInfo.title);
      setStory(storyInfo.story);
      setVisitedDate(storyInfo.visitedDate);
      setVisitedLocation(storyInfo.visitedLocations);
      setStoryImg(storyInfo.imageUrl);
    }
  }, [type, storyInfo]);

  const handleDeleteImg = async () => {
    try {
      if (typeof storyImg === 'string') {
        const response = await axiosInstance.delete("/delete-image", {
          params: { imageUrl: storyImg }
        });
        if (response.data && !response.data.error) {
          setStoryImg(null);
          toast.success("Image removed");
        }
      } else {
        setStoryImg(null);
      }
    } catch (error) {
      toast.error("Failed to delete image");
    }
  };

  const handleAddOrUpdateClick = async () => {
    if (!title) { setError("Please enter the title"); return; }
    if (!story) { setError("Please enter the story"); return; }
    setError("");
    setLoading(true); // Start Loading

    try {
      let imageUrl = storyImg;

      if (storyImg && typeof storyImg === 'object') {
        const imgUploadRes = await uploadImage(storyImg);
        imageUrl = imgUploadRes.imageUrl || "";
      }

      const payload = {
        title,
        story,
        imageUrl: imageUrl || "",
        visitedLocations: visitedLocation,
        visitedDate: visitedDate ? moment(visitedDate).valueOf() : moment().valueOf(),
      };

      if (type === 'edit') {
        await onUpdateStory(storyInfo._id, payload);
      } else {
        await onAddStory(payload);
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false); // Stop Loading
    }
  };

  return (
    <div className='relative'>
      <div className='flex items-center justify-between'>
        <h5 className='text-xl font-medium text-slate-700'>
          {type === "add" ? "Add Story" : "Update Story"}
        </h5>
        
        <div className='flex items-center gap-3 bg-violet-50/50 p-2 rounded-l-lg'>
          {type === 'add' ? (
            <button 
              className={`btn-small flex items-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`} 
              onClick={handleAddOrUpdateClick}
              disabled={loading}
            >
              {loading ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <MdAdd className='text-lg' />} 
              {loading ? "SAVING..." : "ADD STORY"}
            </button>
          ) : (
            <>
              <button 
                className={`btn-small flex items-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`} 
                onClick={handleAddOrUpdateClick}
                disabled={loading}
              >
                {loading ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <MdUpdate className='text-xl' />} 
                {loading ? "SAVING..." : "UPDATE STORY"}
              </button>
              <button 
                className='btn-small bg-red-50 text-red-500 hover:bg-red-100 border-red-100' 
                onClick={() => onDeleteStory(storyInfo)}
                disabled={loading}
              >
                <MdDeleteOutline className='text-xl' /> DELETE
              </button>
            </>
          )}
          <button onClick={onClose}>
            <MdClose className='text-xl text-slate-400' />
          </button>
        </div>
      </div>

      {error && <p className='text-red-500 text-xs pt-2 text-right'>{error}</p>}

      <div className='flex-1 flex flex-col gap-2 pt-4'>
        <label className='input-label'>TITLE</label>
        <input 
          type='text' 
          className='text-slate-950 outline-none text-2xl font-semibold' 
          placeholder='A day at ....'
          value={title} 
          disabled={loading}
          onChange={({ target }) => setTitle(target.value)} 
        />

        <div className='my-3'>
          <DateSelector date={visitedDate} setDate={setVisitedDate} />
        </div>

        <ImageSelector 
          image={storyImg} 
          setImage={setStoryImg} 
          handleDeleteImg={handleDeleteImg} 
        />

        <div className='flex flex-col gap-2 mt-4'>
          <label className='input-label'>STORY</label>
          <textarea 
            className='text-sm text-slate-950 bg-slate-50 p-2 rounded outline-none resize-none' 
            placeholder='Your Story'
            rows={10} 
            value={story} 
            disabled={loading}
            onChange={({ target }) => setStory(target.value)} 
          />
        </div>

        <div className='pt-3 pb-6'>
          <label className='input-label'>VISITED LOCATION</label>
          <TagInput tags={visitedLocation} setTags={setVisitedLocation} />
        </div>
      </div>
    </div>
  );
};

export default AddEditTravelStory;