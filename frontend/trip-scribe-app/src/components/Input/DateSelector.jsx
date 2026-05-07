import React, { useState } from 'react'
import { DayPicker } from 'react-day-picker'
import moment from 'moment'
import { MdClose, MdOutlineDateRange } from 'react-icons/md'

const DateSelector = React.memo(({ date, setDate }) => {
  const [openDatePicker, setOpenDatePicker] = useState(false)
  return (
    <div>
      <button className='inline-flex items-center gap-2 text-[13px] font-medium text-purple-600 bg-purple-200/40 hover:bg-purple-200/70 rounded px-2 py-1 cursor-pointer' onClick={() => {
        setOpenDatePicker(true);
      }}>
        <MdOutlineDateRange className='text-lg' />
        {date ? moment(date).format("Do MMM YYYY")
          : moment().format("Do MMM YYYY")}
      </button>
      {openDatePicker && <div className='p-5 bg-white border border-purple-100 shadow-xl rounded-lg relative pt-9 mt-3 overflow-x-auto w-full max-w-[320px] md:max-w-none' >

        <button className='w-8 h-8 rounded-full flex items-center justify-center bg-purple-50 hover:bg-purple-100 absolute top-2 right-2' onClick={() => {
          setOpenDatePicker(false);
        }}>
          <MdClose className='text-lg text-purple-600' />
        </button>

        <DayPicker
          captionLayout='dropdown-buttons'
          mode='single'
          selected={date}
          onSelect={(d) => { setDate(d); setOpenDatePicker(false); }}
          pagedNavigation />
      </div>}


    </div>
  )
}

export default DateSelector
