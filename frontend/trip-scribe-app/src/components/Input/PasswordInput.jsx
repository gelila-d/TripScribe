import React from 'react'
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa'

const PasswordInput = ({ value, onChange, placeholder }) => {
    const [isShowPassword, setIsShowPassword] = React.useState(false);
    
    const toggleShowPassword = () => {
        setIsShowPassword(!isShowPassword);
    };

    return (
        <div className='flex items-center bg-violet-100 px-5 rounded mb-3'>
            <style>
           
                {`
                    input::-ms-reveal,
                    input::-ms-clear {
                        display: none;
                    }
                `}
            </style>
            
            <input 
                value={value}
                onChange={onChange}
                type={isShowPassword ? 'text' : 'password'} 
                placeholder={placeholder || 'Password'} 
               
                className='w-full text-sm text-violet-950 bg-transparent py-3 mr-3 outline-none' 
            />

            <div className="flex-shrink-0">
                {isShowPassword ? (
                    <FaRegEye
                        size={22}
                        className='text-violet-500 cursor-pointer'
                        onClick={() => toggleShowPassword()}
                    />
                ) : (
                    <FaRegEyeSlash
                        size={22}
                        className='text-violet-400 cursor-pointer'
                        onClick={() => toggleShowPassword()}
                    />
                )}
            </div>
        </div>
    )
}

export default PasswordInput