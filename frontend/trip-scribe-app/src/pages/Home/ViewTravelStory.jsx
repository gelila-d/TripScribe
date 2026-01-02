import moment from 'moment'
import React from 'react'
import { GrMapLocation } from 'react-icons/gr'
import { MdDeleteOutline, MdUpdate, MdClose } from 'react-icons/md'

const ViewTravelStory = ({ storyInfo, onClose, onEditClick, onDeleteClick }) => {
  return (
    <div className='relative'>
      <div className='flex items-center justify-end'>
        <div className='flex items-center gap-3 bg-violet-50/50 p-2 rounded-l-lg'>
          <button className='btn-small flex items-center gap-1' onClick={onEditClick}>
            <MdUpdate className='text-xl' /> UPDATE OR DELETE STORY
          </button>
         
          <button onClick={onClose}>
            <MdClose className='text-xl text-slate-400' />
          </button>
        </div>
      </div>

      <div className='flex-1 flex flex-col gap-2 py-4'>
        <h1 className='text-2xl text-slate-950'>
          {storyInfo?.title}
        </h1>

        <div className='flex items-center justify-between mt-2'>
          <span className='text-xs text-slate-500'>
            {storyInfo?.visitedDate && moment(storyInfo.visitedDate).format("Do MMM YYYY")}
          </span>

          <div className='inline-flex items-center gap-2 text-[13px] text-purple-600 bg-purple-200/40 px-2 py-1 rounded'>
            <GrMapLocation className='text-sm' />
            
            {storyInfo?.visitedLocations?.map((item, index) =>
              storyInfo.visitedLocations.length === index + 1 ? `${item}` : `${item}, `
            )}
          </div>
        </div>
        
       
        <img 
          src={storyInfo?.imageUrl} 
          alt="Selected" 
          className='w-full h-[300px] object-cover rounded-lg mt-4' 
        />

        <div className='mt-4'>
          <p className='text-sm text-slate-950 leading-6 text-justify whitespace-pre-line'>
            {storyInfo?.story}
          </p>
        </div>
      </div>
    </div>
  )
}

export default ViewTravelStory