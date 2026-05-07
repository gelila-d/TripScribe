import moment from 'moment'
import React from 'react'
import { GrMapLocation } from 'react-icons/gr'
import { MdDeleteOutline, MdUpdate, MdClose } from 'react-icons/md'

const ViewTravelStory = React.memo(({ storyInfo, onClose, onEditClick, onDeleteClick }) => {
  return (
    <div className='relative'>
      <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-3'>
        <div className='flex items-center gap-3 bg-violet-50/50 p-2 rounded-lg w-full md:w-auto overflow-x-auto order-2 md:order-1'>
          <button className='btn-small flex items-center gap-1 whitespace-nowrap' onClick={onEditClick}>
            <MdUpdate className='text-xl' /> UPDATE STORY
          </button>

          <button className='btn-small btn-delete flex items-center gap-1 whitespace-nowrap' onClick={onDeleteClick}>
            <MdDeleteOutline className='text-xl' /> DELETE STORY
          </button>

          <button onClick={onClose} className='md:hidden ml-auto'>
            <MdClose className='text-xl text-slate-400' />
          </button>
        </div>
        <button onClick={onClose} className='hidden md:block order-2'>
          <MdClose className='text-xl text-slate-400' />
        </button>
      </div>

      <div className='flex-1 flex flex-col gap-2 py-4'>
        <h1 className='text-xl md:text-2xl text-slate-950 font-semibold'>
          {storyInfo?.title}
        </h1>

        <div className='flex items-center justify-between mt-2'>
          <span className='text-xs text-slate-500'>
            {storyInfo?.visitedDate && moment(storyInfo.visitedDate).format("Do MMM YYYY")}
          </span>

          <div className='inline-flex items-center gap-2 text-[13px] text-purple-600 bg-purple-200/40 px-2 py-1 rounded'>
            <GrMapLocation className='text-sm' />

            <span className='truncate max-w-[150px] md:max-w-none'>
              {storyInfo?.visitedLocations?.map((item, index) =>
                storyInfo.visitedLocations.length === index + 1 ? `${item}` : `${item}, `
              )}
            </span>
          </div>
        </div>


        <img
          src={storyInfo?.imageUrl}
          alt="Selected"
          className='w-full h-[200px] md:h-[300px] object-cover rounded-lg mt-4 shadow-md'
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