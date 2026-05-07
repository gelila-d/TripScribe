import React from 'react';
import { getInitials } from '../../utils/helper.js';

const ProfileInfo = React.memo(({ userInfo, onLogout }) => {
  if (!userInfo) {
    return null;
  }

  return (
    <div className='flex items-center gap-3'>
      <div className='w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full text-slate-950 font-medium bg-slate-100 shrink-0'>
        {getInitials(userInfo.fullName)}
      </div>
      <div className="hidden sm:block">
        <p className='text-sm font-medium'>{userInfo.fullName}</p>
        <button className='text-sm text-slate-700 underline' onClick={onLogout}>
          Logout
        </button>
      </div>
      <div className="sm:hidden">
        <button className='text-sm text-slate-700 underline' onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  );
});

export default ProfileInfo;